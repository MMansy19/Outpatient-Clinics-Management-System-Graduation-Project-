'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDoctor } from '@/lib/api/hooks/useAuth';
import { createDoctorSchema, type CreateDoctorFormData } from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';

const MEDICAL_SPECIALITIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'General Surgery',
  'Hematology',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
] as const;

interface CreateDoctorDialogProps {
  trigger?: React.ReactNode;
}

export function CreateDoctorDialog({ trigger }: CreateDoctorDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createDoctor, isPending } = useCreateDoctor();

  const form = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: Language.ENGLISH,
      socialSecurityNumber: '',
      email: '',
      phone: '',
      password: '',
      speciality: '',
    },
  });

  // Watch the national ID field to show extracted info
  const nationalId = form.watch('socialSecurityNumber');

  // Note: Doctor form doesn't have separate birthdate/gender fields
  // The National ID contains this information and is validated server-side
  // Gender and birthdate are extracted for display purposes only via NationalIdInfo component

  const onSubmit = (data: CreateDoctorFormData) => {
    console.log('📝 Creating doctor with data:', data);
    
    createDoctor(data, {
      onSuccess: (response) => {
        console.log('✅ Doctor created successfully:', response);
        toast.success(`Doctor created successfully! ID: ${response.id}`);
        form.reset();
        setOpen(false);
      },
      onError: (error: unknown) => {
        console.error('❌ Create doctor error:', error);
        
        // Handle different error cases
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as { data?: unknown; status?: number };
          console.error('Response data:', response.data);
          console.error('Response status:', response.status);
          
          // Check if it's a "User already exists" error
          if (response.status === 400 && typeof response.data === 'string' && response.data.includes('already exists')) {
            toast.error('A user with this email or National ID already exists');
            return;
          }
          
          // Get error message from response
          const message = typeof response.data === 'string' 
            ? response.data 
            : (response.data && typeof response.data === 'object' && 'message' in response.data && typeof response.data.message === 'string' 
                ? response.data.message 
                : 'Failed to create doctor');
          toast.error(message);
        } else {
          toast.error('Network error. Please check your connection and try again.');
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Create Doctor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
          <DialogDescription>
            Add a new doctor to the system. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* National ID with extracted info */}
            <FormField
              control={form.control}
              name="socialSecurityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID (14 digits)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="30202041234567" 
                      maxLength={14} 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  {nationalId && nationalId.length === 14 && (
                    <NationalIdInfo nationalId={nationalId} locale="en" />
                  )}
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="doctor@kasralainy.edu.eg" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+201012345678" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Format: +201XXXXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Speciality */}
            <FormField
              control={form.control}
              name="speciality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Speciality</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select speciality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEDICAL_SPECIALITIES.map((speciality) => (
                        <SelectItem key={speciality} value={speciality}>
                          {speciality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="StrongPassword123!" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Minimum 8 characters with uppercase, lowercase, number, and special character
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Arabic (العربية)</SelectItem>
                      <SelectItem value="1">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Doctor'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
