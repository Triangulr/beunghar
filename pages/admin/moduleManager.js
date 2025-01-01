import { useState } from 'react';
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

export function ModuleManager() {
  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Module 1',
      description: 'Introduction to Basics',
      content: '# Module 1\n\nThis is the content for module 1',
      status: 'active',
      students: 150,
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      title: 'Module 2',
      description: 'Advanced Techniques',
      content: '# Module 2\n\nThis is the content for module 2',
      status: 'active',
      students: 120,
      lastUpdated: '2024-03-14'
    },
    {
      id: 3,
      title: 'Module 3',
      description: 'Master the Skills',
      content: '# Module 3\n\nThis is the content for module 3',
      status: 'active',
      students: 85,
      lastUpdated: '2024-03-13'
    }
  ]);

  const [editingModule, setEditingModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewTab, setPreviewTab] = useState("edit");

  const handleEdit = (module) => {
    setEditingModule({ ...module });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingModule) {
      setModules(modules.map(m => 
        m.id === editingModule.id ? editingModule : m
      ));
      setIsEditing(false);
      setEditingModule(null);
    }
  };

  const handleDelete = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  return (
    <div className="exclude-custom-cursor">
      <Card className={`${styles.moduleManagerCard} ${styles.statsCard}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Module Management</CardTitle>
          <Button 
            onClick={() => {
              setEditingModule({
                id: Date.now(),
                title: '',
                description: '',
                content: '',
                status: 'draft',
                students: 0,
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
                key={module.id} 
                className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{module.students} students</span>
                    <span>Last updated: {module.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(module)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(module.id)}>
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
            <DialogTitle className="cursor-default">{editingModule?.id ? 'Edit Module' : 'Create New Module'}</DialogTitle>
            <DialogDescription className="cursor-default">
              Make changes to your module here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 h-full overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="cursor-default">Title</Label>
                <Input
                  id="title"
                  value={editingModule?.title || ''}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    title: e.target.value
                  })}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="cursor-default">Description</Label>
                <Input
                  id="description"
                  value={editingModule?.description || ''}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    description: e.target.value
                  })}
                  className="cursor-text"
                />
              </div>
            </div>

            <Tabs value={previewTab} onValueChange={setPreviewTab} className="flex-1 overflow-hidden">
              <TabsList className="bg-zinc-800 mb-4">
                <TabsTrigger value="edit" className="data-[state=active]:bg-zinc-700 cursor-pointer">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-700 cursor-pointer">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="flex-1 overflow-auto mt-2 border rounded-md">
                <Textarea
                  placeholder="Write your module content here..."
                  value={editingModule?.content || ''}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    content: e.target.value
                  })}
                  className="min-h-[500px] flex-1 bg-zinc-800 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text"
                />
              </TabsContent>
              <TabsContent value="preview" className="markdown-preview bg-zinc-800 p-6 rounded-md overflow-auto mt-2 border h-[500px] cursor-default">
                <div className="prose prose-invert prose-zinc max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editingModule?.content || ''}
                  </ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>
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
    </div>
  );
}
