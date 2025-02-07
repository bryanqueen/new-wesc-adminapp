import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grip, Trash2, Plus, Settings2, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/textarea';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'tel' | 'date' | 'file' | 'textarea' | 'radio';
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customError?: string;
  };
}

interface FormBuilderProps {
  form: {
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      fields: FormField[];
    }>;
    settings?: {
      submitButtonText: string;
      successMessage: string;
      enableEmailNotifications: boolean;
      notificationEmail?: string;
    };
  };
  onChange: (form: {
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      fields: FormField[];
    }>,
    settings?: any
  }) => void;
}

// const PREDEFINED_FIELDS = {
//   personalInfo: [
//     {
//       type: 'text' as const,
//       label: 'Full Name',
//       required: true,
//       placeholder: 'Enter your full name'
//     },
//     {
//       type: 'email' as const,
//       label: 'Email Address',
//       required: true,
//       placeholder: 'Enter your email address'
//     },
//     {
//       type: 'tel' as const,
//       label: 'Phone Number',
//       required: true,
//       placeholder: 'Enter your phone number'
//     }
//   ],
//   education: [
//     {
//       type: 'text' as const,
//       label: 'Previous Institution',
//       required: true,
//       placeholder: 'Enter your previous institution'
//     },
//     {
//       type: 'text' as const,
//       label: 'Qualification',
//       required: true,
//       placeholder: 'Enter your qualification'
//     },
//     {
//       type: 'number' as const,
//       label: 'Year of Completion',
//       required: true,
//       placeholder: 'Enter year of completion'
//     }
//   ]
// };

interface SortableFieldProps {
  sectionId: string
  field: FormField
  onRemoveField: (sectionId: string, fieldId: string) => void
  renderFieldEditor: (sectionId: string, field: FormField) => React.ReactNode
}

function SortableField({ sectionId, field, onRemoveField, renderFieldEditor }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${sectionId}-${field.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={isDragging ? 'opacity-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary rounded"
            >
              <Grip className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <div className="font-medium">{field.label || 'Untitled Field'}</div>
              <div className="text-sm text-gray-500">{field.type}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Field</SheetTitle>
                </SheetHeader>
                {renderFieldEditor(sectionId, field)}
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveField(sectionId, field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function FormBuilder({ form, onChange }: FormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Ensure form and sections always have a default value
  const safeForm = {
    sections: form.sections || [],
    settings: form.settings || {
      submitButtonText: 'Submit',
      successMessage: 'Form submitted successfully',
      enableEmailNotifications: false
    }
  };

  const [newOption, setNewOption] = useState('');

  const addSection = () => {
    const newSection = {
      id: nanoid(),
      title: 'New Section',
      description: '',
      fields: []
    };
    onChange({
      ...safeForm,
      sections: [...safeForm.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<{ title: string, description: string }>) => {
    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    });
  };

  const removeSection = (sectionId: string) => {
    onChange({
      ...safeForm,
      sections: safeForm.sections.filter(section => section.id !== sectionId)
    });
  };

  const addFieldToSection = (sectionId: string, type: FormField['type']) => {
    const newField: FormField = {
      id: nanoid(),
      type,
      label: '',
      placeholder: '',
      required: false,
      validation: {}
    };

    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    });
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
          : section
      )
    });
  };

  const removeField = (sectionId: string, fieldId: string) => {
    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.filter(field => field.id !== fieldId)
          }
          : section
      )
    });
  };

  const addOptionToField = (sectionId: string, fieldId: string, option: string) => {
    if (!option.trim()) return;

    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId
                ? {
                  ...field,
                  options: [...(field.options || []), option.trim()]
                }
                : field
            )
          }
          : section
      )
    });
    setNewOption('');
  };

  const removeOptionFromField = (sectionId: string, fieldId: string, optionToRemove: string) => {
    onChange({
      ...safeForm,
      sections: safeForm.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId
                ? {
                  ...field,
                  options: field.options?.filter(option => option !== optionToRemove)
                }
                : field
            )
          }
          : section
      )
    });
  };

  const updateSettings = (updates: any) => {
    onChange({
      ...safeForm,
      settings: {
        ...safeForm.settings,
        ...updates
      }
    });
  };

  const renderFieldEditor = (sectionId: string, field: FormField) => {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Field Label</Label>
          <Input
            value={field.label}
            onChange={(e) => updateField(sectionId, field.id, { label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div className="space-y-2">
          <Label>Placeholder Text</Label>
          <Input
            value={field.placeholder}
            onChange={(e) => updateField(sectionId, field.id, { placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="flex space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addOptionToField(sectionId, field.id, newOption)
                  }
                }}
                placeholder="Enter new option"
              />
              <Button variant="outline" onClick={() => addOptionToField(sectionId, field.id, newOption)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {field.options?.map((option) => (
                <Badge key={option} variant="secondary" className="flex items-center">
                  {option}
                  <X
                    className="ml-2 h-3 w-3 cursor-pointer"
                    onClick={() => removeOptionFromField(sectionId, field.id, option)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Validation</Label>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => updateField(sectionId, field.id, { required: !!checked })}
            />
            <label htmlFor={`required-${field.id}`}>Required field</label>
          </div>
        </div>
      </div>
    )
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
  
    const activeId = active.id as string;
    const overId = over.id as string;
  
    // Extract section and field IDs, handling both new and existing field formats
    const [activeSecId, ...activeFieldParts] = activeId.split('-');
    const [overSecId, ...overFieldParts] = overId.split('-');
    
    // Rejoin the field parts in case the field ID itself contained hyphens
    const activeFieldId = activeFieldParts.join('-');
    const overFieldId = overFieldParts.join('-');
  
    // Only reorder if within the same section
    if (activeSecId === overSecId && activeId !== overId) {
      const sectionIndex = safeForm.sections.findIndex(
        section => section.id === activeSecId
      );
  
      if (sectionIndex !== -1) {
        const section = safeForm.sections[sectionIndex];
        
        // Find the fields using the actual field IDs (without section prefix)
        const oldIndex = section.fields.findIndex(
          field => normalizeFieldId(field.id) === activeFieldId
        );
        const newIndex = section.fields.findIndex(
          field => normalizeFieldId(field.id) === overFieldId
        );
  
        if (oldIndex !== -1 && newIndex !== -1) {
          const newSections = [...safeForm.sections];
          newSections[sectionIndex] = {
            ...section,
            fields: arrayMove(section.fields, oldIndex, newIndex)
          };
  
          onChange({
            ...safeForm,
            sections: newSections
          });
        }
      }
    }
  };

  const normalizeFieldId = (fieldId: string) => {
    // If the field ID already contains a section ID (e.g., "section1-field1"), return it as is
    if (fieldId.includes('-')) {
      return fieldId;
    }
    // Otherwise, it's a plain field ID, so prefix it with its section ID
    return fieldId;
  };

  // Each section needs its own DndContext to prevent cross-section dragging
  const renderSection = (section: {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
  }) => (
    <Card key={section.id}>
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <div className='w-full'>
            <Input
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Section Title"
              className="font-semibold text-lg"
            />
            <Textarea
              value={section.description || ''}
              onChange={(e) => updateSection(section.id, { description: e.target.value })}
              placeholder="Section Description (optional)"
              className="text-sm text-muted-foreground mt-2"
            />
          </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={section.fields.map(field => `${section.id}-${normalizeFieldId(field.id)}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {section.fields.map((field) => (
                <SortableField
                  key={`${section.id}-${normalizeFieldId(field.id)}`}
                  sectionId={section.id}
                  field={field}
                  onRemoveField={removeField}
                  renderFieldEditor={renderFieldEditor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'text')}>
            <Plus className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'email')}>
            <Plus className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'tel')}>
            <Plus className="h-4 w-4 mr-2" />
            Phone
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'number')}>
            <Plus className="h-4 w-4 mr-2" />
            Number
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'select')}>
            <Plus className="h-4 w-4 mr-2" />
            Dropdown
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'radio')}>
            <Plus className="h-4 w-4 mr-2" />
            Radio
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'checkbox')}>
            <Plus className="h-4 w-4 mr-2" />
            Checkbox
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'textarea')}>
            <Plus className="h-4 w-4 mr-2" />
            Long Text
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'date')}>
            <Plus className="h-4 w-4 mr-2" />
            Date
          </Button>
          <Button variant="outline" onClick={() => addFieldToSection(section.id, 'file')}>
            <Plus className="h-4 w-4 mr-2" />
            File Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {safeForm.sections.map(renderSection)}
      <Button
        variant="outline"
        onClick={addSection}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Section
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Form Settings
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Form Settings</SheetTitle>
            <SheetDescription>
              Configure your form's behavior and notifications
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={safeForm.settings?.submitButtonText || 'Submit'}
                onChange={(e) => updateSettings({ submitButtonText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Success Message</Label>
              <Input
                value={safeForm.settings?.successMessage || 'Form submitted successfully'}
                onChange={(e) => updateSettings({ successMessage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={safeForm.settings?.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ enableEmailNotifications: checked })
                  }
                />
                <Label>Enable Email Notifications</Label>
              </div>
              {safeForm.settings?.enableEmailNotifications && (
                <Input
                  type="email"
                  value={safeForm.settings?.notificationEmail || ''}
                  onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
                  placeholder="Enter notification email"
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default FormBuilder;