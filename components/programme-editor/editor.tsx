import React, { useCallback, useState } from 'react';
import { nanoid } from 'nanoid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '../blog-editor/image-upload';
import { Textarea } from '@/components/ui/textarea';
import { FormBuilder } from './form-builder';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SectionContent =
  | string
  | { url: string; caption?: string }
  | Feature[]
  | { quote: string; author: string; role?: string }

interface SectionData {
  id: string;
  type: 'header' | 'text' | 'image' | 'features' | 'testimonial' | 'certification';
  content: any;
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

interface Certification {
  id: string;
  title: string;
  description: string;
}

interface ProgrammeEditorProps {
  initialProgramme?: {
    title?: string;
    description?: string;
    coverImage?: string;
    content?: SectionData[];
    form?: { fields: any[] };
  };
  onSave: (programme: any) => Promise<void>;
  onChange?: (programme: any) => void; // Add this
}

export function ProgrammeEditor({ 
  initialProgramme, 
  onSave, 
  onChange 
}: ProgrammeEditorProps) {
  const [title, setTitleState] = useState(initialProgramme?.title || '');
  const [description, setDescriptionState] = useState(initialProgramme?.description || '');
  const [coverImage, setCoverImageState] = useState(initialProgramme?.coverImage || '');
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSectionsState] = useState<SectionData[]>(
    initialProgramme?.content || []
  );
  const [form, setFormState] = useState(
    initialProgramme?.form || { 
      sections: [{ 
        id: nanoid(), 
        title: 'New Section', 
        description: '', 
        fields: [] 
      }],
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Form submitted successfully'
      }
    }
  );

  const notifyChange = useCallback(() => {
    if (onChange) {
      const updatedProgramme = {
        title,
        description,
        coverImage,
        content: sections, // Should reflect the updated sections
        form,
      };
      console.log('Notifying Change with Data:', updatedProgramme);
      onChange(updatedProgramme);
    }
  }, [onChange, title, description, coverImage, sections, form]);

  function debounce (func: () => void, delay: number) {
    let timer: NodeJS.Timeout;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(func, delay)
    }
  }

  // Replace all the state setters with wrapped versions that call notifyChange
  const setTitle = (newTitle: string) => {
    setTitleState(newTitle);
    notifyChange();
  };

  const setDescription = (newDescription: string) => {
    setDescriptionState(newDescription);
    notifyChange();
  };

  const setCoverImage = (newImage: string) => {
    setCoverImageState(newImage);
    notifyChange();
  };

  const setSections = (newSections: SectionData[]) => {
    setSectionsState(newSections);
    // Debounce notifyChange to avoid frequent calls during typing
    const debounceNotify = debounce(() => notifyChange(), 300);
    debounceNotify();
  };
  

  const setForm = (newForm: any) => {
    setFormState(newForm);
    notifyChange();
  };

  // Update existing functions to use new setters
  const addSection = (type: SectionData['type']) => {
    const newSection: SectionData = {
      id: nanoid(),
      type,
      content: type === 'features' ? [] :
               type === 'testimonial' ? { quote: '', author: '', role: '' } :
               type === 'certification' ? { title: '', description: '' } :
               ''
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, content: SectionContent) => {
    setSections((prevSections) => 
      prevSections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
    notifyChange();
  };
  
  
  
  const removeSection = (id: string) => {
    const updatedSections = sections.filter((section) => section.id !== id);
    setSections(updatedSections);
    console.log('After Deletion, Updated Sections:', updatedSections); // Log the updated state
    notifyChange(); // Propagate the change
  };
  
  

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  const renderSectionEditor = (section: SectionData, index: number) => {
    switch (section.type) {
case 'header':
  return (
    <Input
      value={section.content || ''} // Add null/undefined check
      onChange={(e) => updateSection(section.id, e.target.value)}
      placeholder="Section Header"
      className="text-xl font-bold"
    />
  );
      
      case 'text':
        return (
          <Textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, e.target.value)}
            placeholder="Enter text content"
            className="min-h-[100px]"
          />
        );

      case 'image':

      //Handle both string and object image content
      const imageContent = typeof section.content === 'string'
        ? { url: section.content, caption: '' }
        : section.content || { url: '', caption: ''};  
        return (
          <div className="space-y-2">
            <ImageUpload
              onUpload={(url) => updateSection(section.id, {
                url,
                caption: imageContent.caption || ''
              })}
              value={imageContent.url}
              className="w-full h-[200px]"
            />
            <Input
              placeholder="Image Caption (optional)"
              value={imageContent.caption || ''}
              onChange={(e) => updateSection(section.id, {
                url: imageContent.url,
                caption: e.target.value
              })}
            />
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            {section.content.map((feature: Feature, i: number) => (
              <div key={feature.id} className="flex gap-2">
                <Input
                  placeholder="Feature Title"
                  value={feature.title}
                  onChange={(e) => {
                    const newFeatures = [...section.content];
                    newFeatures[i] = { ...feature, title: e.target.value };
                    updateSection(section.id, newFeatures);
                  }}
                />
                <Input
                  placeholder="Feature Description"
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...section.content];
                    newFeatures[i] = { ...feature, description: e.target.value };
                    updateSection(section.id, newFeatures);
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    const newFeatures = section.content.filter((f: Feature) => f.id !== feature.id);
                    updateSection(section.id, newFeatures);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newFeature = { id: nanoid(), title: '', description: '' };
                updateSection(section.id, [...section.content, newFeature]);
              }}
            >
              Add Feature
            </Button>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Testimonial Quote"
              value={section.content.quote}
              onChange={(e) => updateSection(section.id, {
                ...section.content,
                quote: e.target.value
              })}
            />
            <Input
              placeholder="Author Name"
              value={section.content.author}
              onChange={(e) => updateSection(section.id, {
                ...section.content,
                author: e.target.value
              })}
            />
            <Input
              placeholder="Author Role (optional)"
              value={section.content.role}
              onChange={(e) => updateSection(section.id, {
                ...section.content,
                role: e.target.value
              })}
            />
          </div>
        );

      case 'certification':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Certification Title"
              value={section.content.title}
              onChange={(e) => updateSection(section.id, {
                ...section.content,
                title: e.target.value
              })}
            />
            <Textarea
              placeholder="Certification Description"
              value={section.content.description}
              onChange={(e) => updateSection(section.id, {
                ...section.content,
                description: e.target.value
              })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Programme Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Programme Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Programme Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <ImageUpload
            onUpload={setCoverImage}
            value={coverImage}
            className="w-full h-[300px]"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Select
                value={section.type}
                onValueChange={(value: SectionData['type']) => {
                  const newSection = {
                    ...section,
                    type: value,
                    content: value === 'features' ? [] :
                             value === 'testimonial' ? { quote: '', author: '', role: '' } :
                             value === 'certification' ? { title: '', description: '' } :
                             ''
                  };
                  setSections(sections.map(s => s.id === section.id ? newSection : s));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Section Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveSection(index, 'up')}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                )}
                {index < sections.length - 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveSection(index, 'down')}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderSectionEditor(section, index)}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => addSection('header')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Header
            </Button>
            <Button variant="outline" onClick={() => addSection('text')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <Button variant="outline" onClick={() => addSection('image')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            <Button variant="outline" onClick={() => addSection('features')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Features
            </Button>
            <Button variant="outline" onClick={() => addSection('testimonial')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
            <Button variant="outline" onClick={() => addSection('certification')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <FormBuilder form={form} onChange={setForm} />
        </CardContent>
      </Card>

      <Button 
        onClick={() => onSave({ title, description, coverImage, content: sections, form })}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        {isLoading ? (
          <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving
          </>
        ) : 
        'Save Programme'

        }
      </Button>
    </div>
  );
}

export default ProgrammeEditor;