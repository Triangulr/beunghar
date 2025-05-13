from fastapi import FastAPI, Request, Response, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import datetime
import time
from functools import wraps
from typing import Callable
import midtransclient
from pymongo import MongoClient
from bson import ObjectId
from svix.webhooks import Webhook, WebhookVerificationError
import json
import os
from google.cloud import storage
import uuid
import subprocess
from starlette.requests import Request
from starlette.responses import Response
import httpx

app = FastAPI()

# Environment variables
CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
CLERK_API_BASE = "https://api.clerk.com/v1"

# CORS middleware instead of Flask's after_request
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS", "DELETE", "PUT"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "user-id", 
        "svix-id", 
        "svix-timestamp", 
        "svix-signature"
    ],
    max_age=3600,
)

# Add this configuration
@app.middleware("http")
async def add_custom_header(request: Request, call_next):
    response = await call_next(request)
    # Increase the maximum request size to 10GB
    response.headers["max-content-length"] = str(10 * 1024 * 1024 * 1024)  # 10GB in bytes
    return response

print("Starting server...")

# Initialize Midtrans client
snap = midtransclient.Snap(
    is_production=False,
    server_key=os.getenv('MIDTRANS_SERVER_KEY'),
    client_key=os.getenv('MIDTRANS_CLIENT_KEY')
)

# MongoDB connection
uri = os.getenv('MONGODB_URI')
client = MongoClient(uri)
db = client.get_database('beunghar')
users_collection = db.get_collection('users')

# Initialize Google Cloud Storage client
storage_client = storage.Client.from_service_account_json(
    os.getenv('GOOGLE_APPLICATION_CREDENTIALS')  
)
bucket_name = "beunghar-affiliate"  
bucket = storage_client.bucket(bucket_name)

# Create new collection for user assets
user_assets = db.get_collection('userAssets')

# Initialize Google Cloud Storage for modules
modules_bucket_name = "beunghar-modules"
modules_bucket = storage_client.bucket(modules_bucket_name)

# Simplified retry decorator without logging
def with_retry(max_retries: int = 3, delay: int = 2) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    result = func(*args, **kwargs)
                    if result:
                        return result
                    print(f"Attempt {retries + 1} failed, retrying...")
                    retries += 1
                    if retries < max_retries:
                        time.sleep(delay)
                except Exception as e:
                    print(f"Error on attempt {retries + 1}: {str(e)}")
                    retries += 1
                    if retries < max_retries:
                        time.sleep(delay)
            return None
        return wrapper
    return decorator

@app.post('/create-transaction-token')
async def create_transaction_token(request: Request):
    try:
        data = await request.json()
        order_id = data.get('orderId')
        user_id = data.get('userId')

        if not order_id or not user_id:
            raise HTTPException(status_code=400, detail='Missing orderId or userId')

        # Find or create user document
        user = users_collection.find_one({'userId': user_id})
        if not user:
            users_collection.insert_one({
                'userId': user_id,
                'orderId': order_id,
                'membershipStatus': 'free',
                'paymentStatus': 'pending',
                'createdAt': datetime.datetime.utcnow()
            })
        else:
            # Update existing user with new orderId
            users_collection.update_one(
                {'userId': user_id},
                {
                    '$set': {
                        'orderId': order_id,
                        'paymentStatus': 'pending',
                        'lastUpdated': datetime.datetime.utcnow()
                    }
                }
            )

        # Create transaction
        gross_amount = 970000 
        
        parameter = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "item_details": [{
                "id": "premium-membership",
                "price": gross_amount,
                "quantity": 1,
                "name": "Premium Membership"
            }],
            "callbacks": {
                "finish": "http://localhost:3000/members"
            }
        }

        transaction_token = snap.create_transaction_token(parameter)
        return {'token': transaction_token}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/midtrans-notification')
async def midtrans_notification(request: Request):
    try:
        notification_json = await request.json()
        print(f"Received notification: {notification_json}")
        
        # Get the transaction status directly from the notification
        order_id = notification_json.get('order_id')
        transaction_status = notification_json.get('transaction_status')
        fraud_status = notification_json.get('fraud_status')
        transaction_id = notification_json.get('transaction_id')

        print(f"Processing transaction - Order ID: {order_id}")
        print(f"Status: {transaction_status}, Fraud Status: {fraud_status}")

        # Find user by orderId
        user = users_collection.find_one({'orderId': order_id})
        
        if not user:
            print(f"No user found with orderId: {order_id}")
            return {'error': 'User not found'}

        # Sample transaction_status handling logic from Midtrans docs
        if transaction_status == 'capture':
            if fraud_status == 'challenge':
                # TODO set transaction status on your database to 'challenge'
                update_status = 'challenge'
            elif fraud_status == 'accept':
                # TODO set transaction status on your database to 'success'
                users_collection.update_one(
                    {'orderId': order_id},
                    {
                        '$set': {
                            'membershipStatus': 'premium',
                            'paymentStatus': 'completed',
                            'transactionStatus': transaction_status,
                            'transactionId': transaction_id,
                            'lastUpdated': datetime.datetime.utcnow()
                        }
                    }
                )
                print(f"Updated to premium: Order ID {order_id}")
        elif transaction_status in ['settlement', 'success']:
            # TODO set transaction status on your database to 'success'
            users_collection.update_one(
                {'orderId': order_id},
                {
                    '$set': {
                        'membershipStatus': 'premium',
                        'paymentStatus': 'completed',
                        'transactionStatus': transaction_status,
                        'transactionId': transaction_id,
                        'lastUpdated': datetime.datetime.utcnow()
                    }
                }
            )
            print(f"Updated to premium: Order ID {order_id}")
        elif transaction_status in ['cancel', 'deny', 'expire']:
            # TODO set transaction status on your database to 'failure'
            users_collection.update_one(
                {'orderId': order_id},
                {
                    '$set': {
                        'paymentStatus': 'failed',
                        'transactionStatus': transaction_status,
                        'transactionId': transaction_id,
                        'lastUpdated': datetime.datetime.utcnow()
                    }
                }
            )
            print(f"Updated to failed: Order ID {order_id}")
        elif transaction_status == 'pending':
            # TODO set transaction status on your database to 'pending'
            users_collection.update_one(
                {'orderId': order_id},
                {
                    '$set': {
                        'paymentStatus': 'pending',
                        'transactionStatus': transaction_status,
                        'transactionId': transaction_id,
                        'lastUpdated': datetime.datetime.utcnow()
                    }
                }
            )
            print(f"Updated to pending: Order ID {order_id}")

        return {
            'message': 'Notification processed successfully',
            'status': transaction_status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/sync-user')
async def sync_user(request: Request):
    try:
        data = await request.json()
        user_id = data.get('userId')
        email = data.get('email')
        
        # Get affiliate data from request if available
        affiliate_ref = data.get('affiliateRef')
        affiliator_user_id = data.get('affiliatorUserId')

        if not user_id or not email:
            raise HTTPException(status_code=400, detail='Missing userId or email')

        @with_retry(max_retries=3, delay=1)
        def get_user_status():
            user = users_collection.find_one({'userId': user_id})
            if user:
                # Only update affiliate information if there isn't an existing one
                # and if we have valid affiliator details
                if not user.get('affiliatorId') and affiliate_ref and affiliator_user_id:
                    users_collection.update_one(
                        {'userId': user_id},
                        {
                            '$set': {
                                'affiliateRef': affiliate_ref,
                                'affiliatorId': affiliator_user_id,
                                'affiliatedAt': datetime.datetime.utcnow()
                            }
                        }
                    )
                    print(f"Updated user {user_id} with affiliate info: {affiliate_ref} from {affiliator_user_id}")
                
                return {
                    'membershipStatus': user['membershipStatus'],
                    'isAdmin': user.get('isAdmin', False)
                }
            else:
                new_user = {
                    'userId': user_id,
                    'email': email,
                    'membershipStatus': 'free',
                    'isAdmin': False
                }
                
                # Add affiliate info to new users if available
                if affiliate_ref and affiliator_user_id:
                    new_user['affiliateRef'] = affiliate_ref
                    new_user['affiliatorId'] = affiliator_user_id
                    new_user['affiliatedAt'] = datetime.datetime.utcnow()
                
                users_collection.insert_one(new_user)
                return {
                    'membershipStatus': 'free',
                    'isAdmin': False
                }

        result = get_user_status()
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks/clerk")
async def clerk_webhook(request: Request):
    # Get the webhook signature from headers
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    # Get the webhook body
    payload = await request.body()
    
    # Verify webhook signature
    try:
        wh = Webhook(os.getenv("CLERK_WEBHOOK_SECRET"))
        wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        })
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # Parse the payload
    body = json.loads(payload)
    event_type = body.get("type")
    
    # Handle user.created event for new sign-ups
    if event_type == "user.created":
        user_id = body.get("data", {}).get("id")
        if user_id:
            # Create a basic user entry in the database
            # Do not set affiliator data yet - that will happen when they visit the members page
            users_collection.update_one(
                {"userId": user_id},
                {
                    "$set": {
                        "userId": user_id,
                        "membershipStatus": "free",
                        "createdAt": datetime.datetime.utcnow()
                    }
                },
                upsert=True
            )
            print(f"Created new user record for {user_id}")
            return {"status": "success", "message": f"User {user_id} created"}

    # Handle user.deleted event
    if event_type == "user.deleted":
        user_id = body.get("data", {}).get("id")
        if user_id:
            users_collection.delete_one({"userId": user_id})
            return {"status": "success", "message": f"User {user_id} deleted"}

    return {"status": "ignored", "message": "Event type not handled"}

@app.post("/api/upload-affiliate-image")
async def upload_affiliate_image(file: UploadFile = File(...), user_id: str = None):
    print("Debug: datetime module:", datetime)
    print("Debug: datetime.datetime:", getattr(datetime, 'datetime', None))
    print(f"Starting upload process for user_id: {user_id}")
    print(f"Using bucket name: {bucket_name}")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Check file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        blob_name = f"affiliate-images/{user_id}/{uuid.uuid4()}.{file_extension}"
        print(f"Generated blob_name: {blob_name}")
        
        # Create blob and upload file
        print(f"Creating blob in bucket: {bucket_name}")
        blob = bucket.blob(blob_name)
        print("Reading file content...")
        content = await file.read()
        print(f"Uploading file, content length: {len(content)} bytes")
        
        # Add more detailed error handling
        try:
            blob.upload_from_string(content, content_type=file.content_type)
        except Exception as upload_error:
            print(f"Detailed upload error: {str(upload_error)}")
            print(f"Bucket name being used: {bucket.name}")
            raise
        
        print("Making blob public...")
        # Make the blob publicly accessible
        blob.make_public()
        
        # Get the public URL
        public_url = blob.public_url
        print(f"Generated public URL: {public_url}")
        
        # Delete old image if exists
        print("Checking for existing asset...")
        existing_asset = user_assets.find_one({"userId": user_id})
        if existing_asset and 'imageUrl' in existing_asset:
            try:
                print("Deleting old image...")
                old_blob_name = existing_asset['imageUrl'].split('/')[-1]
                old_blob = bucket.blob(f"affiliate-images/{user_id}/{old_blob_name}")
                old_blob.delete()
            except Exception as e:
                print(f"Error deleting old image: {str(e)}")
        
        # Update or insert the new image URL in MongoDB
        print("Updating MongoDB...")
        user_assets.update_one(
            {"userId": user_id},
            {
                "$set": {
                    "imageUrl": public_url,
                    "lastUpdated": datetime.datetime.utcnow()
                }
            },
            upsert=True
        )
        
        print("Upload process completed successfully")
        return {
            "status": "success",
            "imageUrl": public_url
        }
        
    except Exception as e:
        print(f"Error during upload process: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user-asset/{user_id}")
async def get_user_asset(user_id: str):
    print(f"Fetching asset for user_id: {user_id}")
    try:
        asset = user_assets.find_one({"userId": user_id})
        if asset:
            return {
                "imageUrl": asset.get("imageUrl"),
                "lastUpdated": asset.get("lastUpdated")
            }
        return {"imageUrl": None}
    except Exception as e:
        print(f"Error fetching user asset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

visitor_collection = db.get_collection('visitors')

@app.post("/api/track-visit")
async def track_visit(request: Request):
    # This is now a no-op function as we're using Cloudflare Analytics
    # Kept for backward compatibility
    return {"status": "success"}

@app.get("/api/visitor-stats")
async def get_visitor_stats(time_span: str = "24h"):
    try:
        # Cloudflare GraphQL Analytics API endpoint
        url = "https://api.cloudflare.com/client/v4/graphql"
        
        # Get Cloudflare zone ID and API token from environment variables
        cf_zone_id = os.getenv("CLOUDFLARE_ZONE_ID")
        cf_api_token = os.getenv("CLOUDFLARE_API_TOKEN")
        
        if not cf_zone_id:
            print("CLOUDFLARE_ZONE_ID environment variable is not set")
            raise HTTPException(status_code=500, detail="Cloudflare Zone ID not configured")
            
        if not cf_api_token:
            print("CLOUDFLARE_API_TOKEN environment variable is not set")
            raise HTTPException(status_code=500, detail="Cloudflare API token not configured")
        
        # Set time range based on the time_span parameter - using YYYY-MM-DD format only
        now = datetime.datetime.utcnow()
        if time_span == "24h":
            start_time = (now - datetime.timedelta(hours=24)).strftime("%Y-%m-%d")
            interval = "1h"
        elif time_span == "7d":
            start_time = (now - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
            interval = "1d"
        elif time_span == "30d":
            start_time = (now - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
            interval = "1d"
        else:
            raise HTTPException(status_code=400, detail="Invalid time span")
        
        print(f"Fetching Cloudflare analytics with zone_id: {cf_zone_id}, start_time: {start_time}")
        
        # Updated GraphQL query using the correct field names for unique visitors
        query = """
        query {
          viewer {
            zones(filter: {zoneTag: "%s"}) {
              httpRequests1dGroups(
                limit: 1000
                filter: {date_gt: "%s"}
                orderBy: [date_ASC]
              ) {
                dimensions {
                  date
                }
                sum {
                  requests
                  pageViews
                }
                uniq {
                  uniques
                }
              }
            }
          }
        }
        """ % (cf_zone_id, start_time)
        
        # Make request to Cloudflare GraphQL API
        async with httpx.AsyncClient() as client:
            print("Sending request to Cloudflare GraphQL API")
            response = await client.post(
                url,
                json={"query": query},
                headers={
                    "Authorization": f"Bearer {cf_api_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                print(f"Cloudflare API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, 
                                  detail="Failed to fetch data from Cloudflare")
            
            data = response.json()
            print("Raw API response:", json.dumps(data, indent=2))
            
            # Check for GraphQL errors
            if "errors" in data and data["errors"] is not None and len(data["errors"]) > 0:
                print(f"GraphQL errors: {data['errors']}")
                error_message = data['errors'][0]['message']
                raise HTTPException(status_code=500, detail=error_message)
            else:
                print("No GraphQL errors found")
            
            # Extract and format the data
            try:
                print("Accessing data structure...")
                # Check if data exists
                if not data:
                    print("API response is empty")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                # Check data.data
                data_obj = data.get("data")
                if data_obj is None:
                    print("data.data is None")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                # Check data.data.viewer
                viewer = data_obj.get("viewer")
                if viewer is None:
                    print("data.data.viewer is None")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                # Check data.data.viewer.zones
                zones = viewer.get("zones", [])
                if not zones:
                    print("No zones found in Cloudflare response")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                print(f"Found {len(zones)} zones")
                
                # Safe access to first zone
                if len(zones) == 0:
                    print("Zones list is empty")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                first_zone = zones[0]
                if first_zone is None:
                    print("First zone is None")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                # Check httpRequests1dGroups
                http_requests = first_zone.get("httpRequests1dGroups", [])
                if not http_requests:
                    print("No HTTP requests data found")
                    return {"uniqueVisitors": 0, "timeSpan": time_span, "visitorData": []}
                
                print(f"Found {len(http_requests)} data points")
                
                visitor_data = []
                total_visitors = 0
                
                for i, entry in enumerate(http_requests):
                    print(f"Processing entry {i}:", entry)
                    
                    if entry is None:
                        print(f"Entry {i} is None, skipping")
                        continue
                        
                    date_str = entry.get("dimensions", {}).get("date", "unknown")
                    uniq_data = entry.get("uniq")
                    
                    if uniq_data is None:
                        print(f"uniq data for entry {i} is None")
                        unique_visitors = 0
                    else:
                        unique_visitors = uniq_data.get("uniques", 0)
                        
                    total_visitors += unique_visitors
                    
                    visitor_data.append({
                        "date": date_str,
                        "visitors": unique_visitors
                    })
                
                print(f"Successfully fetched analytics data: {len(visitor_data)} data points, {total_visitors} total visitors")
                return {
                    "uniqueVisitors": total_visitors,
                    "timeSpan": time_span,
                    "visitorData": visitor_data
                }
                
            except Exception as e:
                print(f"Error parsing Cloudflare response: {str(e)}")
                print(f"Error type: {type(e).__name__}")
                print(f"Error location: {e.__traceback__.tb_frame.f_code.co_name}, line {e.__traceback__.tb_lineno}")
                print(f"Response data: {data}")
                raise HTTPException(status_code=500, detail=f"Error parsing response: {str(e)}")
                
    except Exception as e:
        print(f"Error fetching visitor stats: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        if hasattr(e, '__traceback__'):
            print(f"Error location: {e.__traceback__.tb_frame.f_code.co_name}, line {e.__traceback__.tb_lineno}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/member-stats")
async def get_member_stats(time_span: str = "24h"):
    try:
        now = datetime.datetime.utcnow()
        if time_span == "24h":
            start_time = now - datetime.timedelta(hours=24)
            interval = datetime.timedelta(hours=1)
            format_string = "%H:00"
        elif time_span == "7d":
            start_time = now - datetime.timedelta(days=7)
            interval = datetime.timedelta(days=1)
            format_string = "%d %b"
        elif time_span == "30d":
            start_time = now - datetime.timedelta(days=30)
            interval = datetime.timedelta(days=1)
            format_string = "%d %b"
        else:
            raise HTTPException(status_code=400, detail="Invalid time span")

        # Get time series data for premium members
        pipeline = [
            {
                "$match": {
                    "membershipStatus": "premium",
                    "lastUpdated": {"$gte": start_time}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": format_string,
                            "date": "$lastUpdated"
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "date": "$_id",
                    "members": "$count"
                }
            },
            {
                "$sort": {"date": 1}
            }
        ]

        member_data = list(users_collection.aggregate(pipeline))
        
        # Count total premium members
        premium_members = users_collection.count_documents({
            "membershipStatus": "premium"
        })

        return {
            "premiumMembers": premium_members,
            "timeSpan": time_span,
            "memberData": member_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

modules_collection = db.get_collection('modules')

async def verify_admin(user_id: str) -> bool:
    try:
        user = users_collection.find_one({'userId': user_id})
        if not user:
            return False
            
        # Handle both boolean and string values for isAdmin
        is_admin = user.get('isAdmin')
        if isinstance(is_admin, bool):
            return is_admin
        elif isinstance(is_admin, str):
            return is_admin.lower() == 'true'  # Case-insensitive comparison
        return False
        
    except Exception as e:
        print(f"Error verifying admin status: {str(e)}")
        return False

@app.get('/api/modules')
async def get_modules(request: Request):
    try:
        # Remove admin verification for GET request
        modules = list(modules_collection.find())
        for module in modules:
            module['_id'] = str(module['_id'])
        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/modules')
async def create_module(request: Request):
    try:
        user_id = request.headers.get('user-id')
        if not user_id or not await verify_admin(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        data = await request.json()
        module = {
            'title': data['title'],
            'description': data['description'],
            'sections': data['sections'],
            'status': data['status'],
            'isPremium': data.get('isPremium', True),
            'difficulty': data.get('difficulty', 'Beginner'),  # Add default difficulty
            'createdAt': datetime.datetime.utcnow(),
            'lastUpdated': datetime.datetime.utcnow()
        }
        result = modules_collection.insert_one(module)
        return {'id': str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/modules/{module_id}')
async def update_module(module_id: str, request: Request):
    try:
        user_id = request.headers.get('user-id')
        if not user_id or not await verify_admin(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        data = await request.json()
        modules_collection.update_one(
            {'_id': ObjectId(module_id)},
            {'$set': {
                'title': data['title'],
                'description': data['description'],
                'sections': data['sections'],
                'status': data['status'],
                'isPremium': data.get('isPremium', True),
                'difficulty': data.get('difficulty', 'Beginner'),  # Add difficulty field
                'lastUpdated': datetime.datetime.utcnow()
            }}
        )
        return {'status': 'success'}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/api/modules/{module_id}')
async def delete_module(module_id: str, request: Request):
    try:
        user_id = request.headers.get('user-id')
        if not user_id or not await verify_admin(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        result = modules_collection.delete_one({'_id': ObjectId(module_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Module not found")
        return {'status': 'success'}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/modules/{module_id}')
async def get_module(module_id: str):
    try:
        module = modules_collection.find_one({'_id': ObjectId(module_id)})
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Convert ObjectId to string for JSON serialization
        module['_id'] = str(module['_id'])
        return module
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/affiliate-id/{user_id}")
async def get_affiliate_id(user_id: str):
    try:
        user_asset = user_assets.find_one({"userId": user_id})
        return {
            "affiliateId": user_asset.get("affiliateId", user_id),
            "description": user_asset.get("affiliateDescription", ""),
            "name": user_asset.get("affiliateName", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update-affiliate-id")
async def update_affiliate_id(request: Request):
    try:
        data = await request.json()
        user_id = data.get("userId")
        affiliate_id = data.get("affiliateId")
        description = data.get("description", "")
        name = data.get("name", "")

        if not user_id or not affiliate_id:
            raise HTTPException(status_code=400, detail="Missing userId or affiliateId")

        # Check if affiliate ID is already taken
        existing_user = user_assets.find_one({
            "userId": {"$ne": user_id},  # not equal to current user
            "affiliateId": affiliate_id
        })
        
        if existing_user:
            raise HTTPException(status_code=400, detail="This affiliate ID is already taken")

        # Update user's affiliate ID, description, and name
        result = user_assets.update_one(
            {"userId": user_id},
            {"$set": {
                "affiliateId": affiliate_id,
                "affiliateDescription": description,
                "affiliateName": name
            }},
            upsert=True  # Create document if it doesn't exist
        )

        if result.matched_count == 0 and result.upserted_id is None:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "affiliateId": affiliate_id,
            "description": description,
            "name": name
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/affiliate-image/{affiliate_id}")
async def get_affiliate_image(affiliate_id: str):
    try:
        # First find the user asset document with this affiliate ID
        user_asset = user_assets.find_one({"affiliateId": affiliate_id})
        
        # If not found by affiliateId, try using it as userId (for backward compatibility)
        if not user_asset:
            user_asset = user_assets.find_one({"userId": affiliate_id})
        
        if user_asset:
            return {
                "imageUrl": user_asset.get("imageUrl"),
                "description": user_asset.get("affiliateDescription", ""),
                "name": user_asset.get("affiliateName", ""),
                "userId": user_asset.get("userId")  # Return the userId of the affiliate creator
            }
        return {
            "imageUrl": None,
            "description": "",
            "name": "",
            "userId": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/publicModules')
async def get_public_modules():
    try:
        # Only fetch necessary fields for public display
        modules = list(modules_collection.find(
            {},  # Query all documents
            {   # Project only needed fields
                'title': 1,
                'description': 1,
                'sections': {'$size': '$sections'},  # Count of sections only
                '_id': 1,
                'difficulty': 1
            }
        ))
        
        # Convert ObjectId to string for JSON serialization
        for module in modules:
            module['_id'] = str(module['_id'])
            
        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_clerk_users():
    """Fetch users from Clerk API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{CLERK_API_BASE}/users",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch users from Clerk")

@app.get('/api/users')
async def get_users(request: Request):
    try:
        # First verify if the requesting user is an admin
        user_id = request.headers.get('user-id')
        if not user_id or not await verify_admin(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Get all users from Clerk with pagination
        all_clerk_users = []
        limit = 100  # Maximum allowed by Clerk
        offset = 0
        
        async with httpx.AsyncClient() as client:
            while True:
                print(f"Fetching Clerk users with offset: {offset}")
                response = await client.get(
                    f"{CLERK_API_BASE}/users",
                    headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
                    params={
                        "limit": limit,
                        "offset": offset,
                        "order_by": "-created_at"  # Sort by newest first
                    }
                )
                
                if response.status_code != 200:
                    print(f"Clerk API error: {response.status_code} - {response.text}")
                    raise HTTPException(status_code=response.status_code, 
                                      detail="Failed to fetch users from Clerk")
                
                clerk_users = response.json()
                print(f"Received {len(clerk_users)} users from Clerk")
                
                if not clerk_users:  # No more users to fetch
                    break
                    
                all_clerk_users.extend(clerk_users)
                
                if len(clerk_users) < limit:  # Last page
                    break
                    
                offset += limit
                
            print(f"Total users fetched from Clerk: {len(all_clerk_users)}")
        
        # Get MongoDB data for all users
        mongo_users = {user['userId']: user for user in users_collection.find()}
        print(f"Fetched {len(mongo_users)} user records from MongoDB")
        
        # Format the response
        formatted_users = []
        for clerk_user in all_clerk_users:
            try:
                user_id = clerk_user['id']
                mongo_data = mongo_users.get(user_id, {})
                
                # Get primary email from Clerk data
                primary_email = None
                email_addresses = clerk_user.get('email_addresses', [])
                if email_addresses and len(email_addresses) > 0:
                    # First try to get the primary email using primary_email_address_id
                    primary_email_id = clerk_user.get('primary_email_address_id')
                    if primary_email_id:
                        for email in email_addresses:
                            if email.get('id') == primary_email_id:
                                primary_email = email.get('email_address')
                                break
                    
                    # If no primary email found, use the first email
                    if not primary_email:
                        primary_email = email_addresses[0].get('email_address')
                
                # Get full name from first_name and last_name fields
                first_name = clerk_user.get('first_name', '')
                last_name = clerk_user.get('last_name', '')
                full_name = f"{first_name} {last_name}".strip()
                
                if not full_name:
                    # Try getting name from external accounts if available
                    external_accounts = clerk_user.get('external_accounts', [])
                    if external_accounts and len(external_accounts) > 0:
                        ext_first_name = external_accounts[0].get('first_name', '')
                        ext_last_name = external_accounts[0].get('last_name', '')
                        full_name = f"{ext_first_name} {ext_last_name}".strip()
                
                if not full_name:
                    full_name = 'Unknown'
                
                # Check user status - banned, locked, or active
                is_banned = clerk_user.get('banned', False)
                is_locked = clerk_user.get('locked', False)
                status = 'inactive' if (is_banned or is_locked) else 'active'
                
                formatted_user = {
                    'id': user_id,
                    'email': primary_email,
                    'name': full_name,
                    'status': status,
                    'isAdmin': mongo_data.get('isAdmin', False),
                    'membershipStatus': mongo_data.get('membershipStatus', 'free'),
                    'imageUrl': clerk_user.get('image_url', clerk_user.get('profile_image_url')),
                    'last_active_at': clerk_user.get('last_active_at'),
                    'banned': is_banned, 
                    'locked': is_locked,
                    # Add affiliate information
                    'affiliatorId': mongo_data.get('affiliatorId'),
                    'affiliateRef': mongo_data.get('affiliateRef'),
                    'affiliatedAt': mongo_data.get('affiliatedAt')
                }
                
                formatted_users.append(formatted_user)
                
            except Exception as user_error:
                print(f"Error processing user {clerk_user.get('id')}: {str(user_error)}")
                print(f"User data: {json.dumps(clerk_user, indent=2)}")
                continue
        
        print(f"Successfully formatted {len(formatted_users)} users")
        return {'users': formatted_users}
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/users/{user_id}/toggle-admin')
async def toggle_admin(user_id: str, request: Request):
    try:
        # First verify if the requesting user is an admin
        requesting_user_id = request.headers.get('user-id')
        if not requesting_user_id or not await verify_admin(requesting_user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Verify user exists in Clerk
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CLERK_API_BASE}/users/{user_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="User not found in Clerk")

        # Get the new admin status from request body
        data = await request.json()
        new_admin_status = data.get('isAdmin')

        if new_admin_status is None:
            raise HTTPException(status_code=400, detail="Missing isAdmin in request body")

        # Update the user's admin status in MongoDB
        result = users_collection.update_one(
            {'userId': user_id},
            {
                '$set': {
                    'isAdmin': new_admin_status,
                    'lastUpdated': datetime.datetime.utcnow()
                }
            },
            upsert=True
        )

        return {'status': 'success', 'isAdmin': new_admin_status}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in toggle_admin: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/users/{user_id}/toggle-premium')
async def toggle_premium(user_id: str, request: Request):
    try:
        # First verify if the requesting user is an admin
        requesting_user_id = request.headers.get('user-id')
        if not requesting_user_id or not await verify_admin(requesting_user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Verify user exists in Clerk
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CLERK_API_BASE}/users/{user_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="User not found in Clerk")

        # Get the new premium status from request body
        data = await request.json()
        is_premium = data.get('isPremium')

        if is_premium is None:
            raise HTTPException(status_code=400, detail="Missing isPremium in request body")

        # Update the user's premium status in MongoDB
        result = users_collection.update_one(
            {'userId': user_id},
            {
                '$set': {
                    'membershipStatus': 'premium' if is_premium else 'free',
                    'lastUpdated': datetime.datetime.utcnow()
                }
            },
            upsert=True
        )

        return {'status': 'success', 'membershipStatus': 'premium' if is_premium else 'free'}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in toggle_premium: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/users/{user_id}/toggle-ban')
async def toggle_ban(user_id: str, request: Request):
    try:
        # First verify if the requesting user is an admin
        requesting_user_id = request.headers.get('user-id')
        if not requesting_user_id or not await verify_admin(requesting_user_id):
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Get the current user data from Clerk to check current ban status
        async with httpx.AsyncClient() as client:
            get_response = await client.get(
                f"{CLERK_API_BASE}/users/{user_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            
            if get_response.status_code != 200:
                raise HTTPException(status_code=404, detail="User not found in Clerk")
            
            user_data = get_response.json()
            currently_banned = user_data.get('banned', False)

            # Toggle ban status using Clerk's API
            if currently_banned:
                # Unban the user
                response = await client.post(
                    f"{CLERK_API_BASE}/users/{user_id}/unban",
                    headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
                )
            else:
                # Ban the user
                response = await client.post(
                    f"{CLERK_API_BASE}/users/{user_id}/ban",
                    headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
                )
            
            if response.status_code not in [200, 201]:
                print(f"Error from Clerk API: {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to {'unban' if currently_banned else 'ban'} user"
                )

            return {
                'status': 'success',
                'banned': not currently_banned  # Return the new ban status
            }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in toggle_ban: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))