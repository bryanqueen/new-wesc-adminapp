import React from 'react';
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
import { Grip, Trash2, Plus, Settings2 } from 'lucide-react';
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
    fields: FormField[];
    settings?: {
      submitButtonText: string;
      successMessage: string;
      enableEmailNotifications: boolean;
      notificationEmail?: string;
    };
  };
  onChange: (form: { fields: FormField[], settings?: any }) => void;
}

const PREDEFINED_FIELDS = {
  personalInfo: [
    {
      type: 'text' as const,
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      type: 'email' as const,
      label: 'Email Address',
      required: true,
      placeholder: 'Enter your email address'
    },
    {
      type: 'tel' as const,
      label: 'Phone Number',
      required: true,
      placeholder: 'Enter your phone number'
    }
  ],
  education: [
    {
      type: 'text' as const,
      label: 'Previous Institution',
      required: true,
      placeholder: 'Enter your previous institution'
    },
    {
      type: 'text' as const,
      label: 'Qualification',
      required: true,
      placeholder: 'Enter your qualification'
    },
    {
      type: 'number' as const,
      label: 'Year of Completion',
      required: true,
      placeholder: 'Enter year of completion'
    }
  ]
};

export function FormBuilder({ form, onChange }: FormBuilderProps) {
  const [selectedField, setSelectedField] = React.useState<FormField | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: nanoid(),
      type,
      label: '',
      placeholder: '',
      required: false,
      validation: {}
    };
    onChange({ 
      ...form,
      fields: [...form.fields, newField]
    });
  };

  const addPredefinedFields = (fields: Partial<FormField>[]) => {
    const newFields = fields.map(field => ({
      ...field,
      id: nanoid()
    })) as FormField[];
    
    onChange({
      ...form,
      fields: [...form.fields, ...newFields]
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange({
      ...form,
      fields: form.fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    });
  };

  const removeField = (id: string) => {
    onChange({
      ...form,
      fields: form.fields.filter(field => field.id !== id)
    });
  };

  const updateSettings = (updates: any) => {
    onChange({
      ...form,
      settings: {
        ...form.settings,
        ...updates
      }
    });
  };

  const renderFieldEditor = (field: FormField) => {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Field Label</Label>
          <Input
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div className="space-y-2">
          <Label>Placeholder Text</Label>
          <Input
            value={field.placeholder}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="space-y-2">
          <Label>Help Text</Label>
          <Input
            value={field.helpText}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            placeholder="Enter help text"
          />
        </div>

        {(field.type === 'select' || field.type === 'radio') && (
          <div className="space-y-2">
            <Label>Options (one per line)</Label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded"
              value={field.options?.join('\n')}
              onChange={(e) => updateField(field.id, {
                options: e.target.value.split('\n').filter(Boolean)
              })}
              placeholder="Enter options"
            />
          </div>
        )}

        <div className="space-y-4">
          <Label>Validation</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => 
                updateField(field.id, { required: !!checked })
              }
            />
            <label htmlFor={`required-${field.id}`}>Required field</label>
          </div>

          {(field.type === 'text' || field.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Length</Label>
                <Input
                  type="number"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => updateField(field.id, {
                    validation: {
                      ...field.validation,
                      minLength: parseInt(e.target.value) || undefined
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Length</Label>
                <Input
                  type="number"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => updateField(field.id, {
                    validation: {
                      ...field.validation,
                      maxLength: parseInt(e.target.value) || undefined
                    }
                  })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Custom Error Message</Label>
            <Input
              value={field.validation?.customError || ''}
              onChange={(e) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  customError: e.target.value
                }
              })}
              placeholder="Enter custom error message"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Form Fields</h3>
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
                  value={form.settings?.submitButtonText || 'Submit'}
                  onChange={(e) => updateSettings({ submitButtonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Success Message</Label>
                <Input
                  value={form.settings?.successMessage || 'Form submitted successfully'}
                  onChange={(e) => updateSettings({ successMessage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.settings?.enableEmailNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ enableEmailNotifications: checked })
                    }
                  />
                  <Label>Enable Email Notifications</Label>
                </div>
                {form.settings?.enableEmailNotifications && (
                  <Input
                    type="email"
                    value={form.settings?.notificationEmail || ''}
                    onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
                    placeholder="Enter notification email"
                  />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="predefined">
          <AccordionTrigger>Predefined Field Groups</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => addPredefinedFields(PREDEFINED_FIELDS.personalInfo)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Personal Info Fields
              </Button>
              <Button
                variant="outline"
                onClick={() => addPredefinedFields(PREDEFINED_FIELDS.education)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education Fields
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4">
        {form.fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Grip className="h-4 w-4 text-gray-400" />
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
                    {renderFieldEditor(field)}
                  </SheetContent>
                </Sheet>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button variant="outline" onClick={() => addField('text')}>
          <Plus className="h-4 w-4 mr-2" />
          Text
        </Button>
        <Button variant="outline" onClick={() => addField('email')}>
          <Plus className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="outline" onClick={() => addField('tel')}>
          <Plus className="h-4 w-4 mr-2" />
          Phone
        </Button>
        <Button variant="outline" onClick={() => addField('number')}>
          <Plus className="h-4 w-4 mr-2" />
          Number
        </Button>
        <Button variant="outline" onClick={() => addField('select')}>
          <Plus className="h-4 w-4 mr-2" />
          Dropdown
        </Button>
        <Button variant="outline" onClick={() => addField('radio')}>
          <Plus className="h-4 w-4 mr-2" />
          Radio
        </Button>
        <Button variant="outline" onClick={() => addField('checkbox')}>
          <Plus className="h-4 w-4 mr-2" />
          Checkbox
        </Button>
        <Button variant="outline" onClick={() => addField('textarea')}>
          <Plus className="h-4 w-4 mr-2" />
          Long Text
        </Button>
        <Button variant="outline" onClick={() => addField('date')}>
          <Plus className="h-4 w-4 mr-2" />
          Date
        </Button>
        <Button variant="outline" onClick={() => addField('file')}>
          <Plus className="h-4 w-4 mr-2" />
          File Upload
        </Button>
      </div>
    </div>
  );
}