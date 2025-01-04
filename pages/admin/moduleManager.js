import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '@/styles/AdminPage.module.css';
import { useUser } from '@clerk/nextjs';

const ModuleManager = () => {
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState({
    _id: null,
    title: '',
    description: '',
    sections: [{ title: '', description: '', content: '' }],
    status: 'draft',
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewTab, setPreviewTab] = useState("edit");
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/modules', {
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || ''
        }
      });
      if (response.status === 403) {
        throw new Error('Unauthorized');
      }
      const data = await response.json();
      setModules(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setLoading(false);
    }
  };

  const handleEdit = (module) => {
    console.log('Editing module:', module);
    setEditingModule({
      _id: module._id,
      title: module.title || '',
      description: module.description || '',
      sections: module.sections || [{ title: '', description: '', content: '' }],
      status: module.status || 'draft',
      lastUpdated: module.lastUpdated || new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editingModule) {
      try {
        const url = editingModule._id
          ? `https://beunghar-api-92744157839.asia-south1.run.app/api/modules/${editingModule._id}`
          : 'https://beunghar-api-92744157839.asia-south1.run.app/api/modules';
        
        const method = editingModule._id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'user-id': user?.id || ''
          },
          body: JSON.stringify({
            title: editingModule.title || '',
            description: editingModule.description || '',
            sections: editingModule.sections || [],
            status: editingModule.status || 'draft',
            students: editingModule.students || 0,
            lastUpdated: new Date().toISOString()
          }),
        });

        if (response.status === 403) {
          throw new Error('Unauthorized');
        }

        if (response.ok) {
          await fetchModules();
          setIsEditing(false);
          setEditingModule(null);
        } else {
          console.error('Error saving:', await response.text());
        }
      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  };

  const handleDelete = async (moduleId) => {
    try {
      const response = await fetch(
        `https://beunghar-api-92744157839.asia-south1.run.app/api/modules/${moduleId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user-id': user?.id || ''
          },
          mode: 'cors'
        }
      );

      if (response.status === 403) {
        throw new Error('Unauthorized');
      }

      if (response.ok) {
        await fetchModules();
        setModuleToDelete(null);
      } else {
        const errorText = await response.text();
        console.error('Error deleting module:', errorText);
        alert('Failed to delete module: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module: ' + error.message);
    }
  };

  const handleAddSection = () => {
    setEditingModule(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', description: '', content: '' }]
    }));
  };

  const handleRemoveSection = (index) => {
    setEditingModule(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleSectionChange = (index, field, value) => {
    setEditingModule(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  return (
    <div className="exclude-custom-cursor">
      <Card className={`${styles.moduleManagerCard} ${styles.statsCard}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Module Manager</CardTitle>
          <Button 
            onClick={() => {
              setEditingModule({
                _id: null,
                title: '',
                description: '',
                sections: [{ title: '', description: '', content: '' }],
                status: 'draft',
                lastUpdated: new Date().toISOString().split('T')[0]
              });
              setIsEditing(true);
            }}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add New Module
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module) => (
              <div 
                key={module._id} 
                className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">{module.title || 'Untitled'}</h3>
                  <p className="text-sm text-muted-foreground">{module.description || 'No description'}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Last updated: {module.lastUpdated || 'Never'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="View" 
                    onClick={() => window.open(`/modules/${module._id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(module)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Delete" 
                    onClick={() => setModuleToDelete(module)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[900px] w-[90vw] h-[90vh] bg-zinc-900 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1100] cursor-default exclude-custom-cursor">
          <DialogHeader>
            <DialogTitle className="cursor-default">
              {editingModule?._id ? 'Edit Module' : 'Create New Module'}
            </DialogTitle>
            <DialogDescription className="cursor-default">
              Make changes to your module here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 h-full overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Module Title</Label>
                <Input
                  value={editingModule?.title || ''}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    title: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Module Description</Label>
                <Input
                  value={editingModule?.description || ''}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    description: e.target.value
                  })}
                />
              </div>
            </div>

            <div className={`flex-1 overflow-auto ${styles.customScroll}`}>
              {editingModule?.sections.map((section, index) => (
                <div key={index} className="mb-6 p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Section {index + 1}</h3>
                    {editingModule.sections.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSection(index)}
                      >
                        Remove Section
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Section Description</Label>
                      <Input
                        value={section.description}
                        onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                      />
                    </div>

                    <Tabs defaultValue="edit" className="bg-zinc-800/50 p-4 rounded-lg">
                      <TabsList className="bg-zinc-900">
                        <TabsTrigger value="edit" className="data-[state=active]:bg-zinc-700">Edit</TabsTrigger>
                        <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-700">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit" className="bg-zinc-800/50 rounded-md mt-2">
                        <Textarea
                          placeholder="Write your section content here..."
                          value={section.content}
                          onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                          className="min-h-[200px] bg-transparent border-zinc-700"
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="bg-zinc-800/50 rounded-md mt-2 p-4 prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section.content}
                        </ReactMarkdown>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddSection}
                className="w-full mt-4"
              >
                Add New Section
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 cursor-pointer">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
        <DialogContent className="max-w-[400px] bg-zinc-900 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1100] cursor-default exclude-custom-cursor">
          <DialogHeader>
            <DialogTitle className="cursor-default">Delete Module</DialogTitle>
            <DialogDescription className="cursor-default">
              Are you sure you want to delete "{moduleToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setModuleToDelete(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleDelete(moduleToDelete._id)}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleManager;
