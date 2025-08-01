'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Pill, Trash2, Plus, Loader2 } from 'lucide-react';
import kioskDataService from '@/lib/services/kiosk-data-service';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  notes: string;
}

interface MedicationsData {
  medications: Medication[];
  noMedications: boolean;
}

export default function MedicationsStepReal({ data, onNext, onBack }: StepComponentProps) {
  const [formData, setFormData] = useState<MedicationsData>({
    medications: data.medications ? data.medications.map((med: string, index: number) => ({
      id: `med_${index}`,
      name: med,
      dosage: '',
      frequency: '',
      prescribedBy: '',
      startDate: '',
      notes: ''
    })) : [],
    noMedications: !data.medications || data.medications.length === 0
  });

  const [availableMedications, setAvailableMedications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newMedicationName, setNewMedicationName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Load available medications from Firestore
  useEffect(() => {
    const loadMedications = async () => {
      try {
        setLoading(true);
        const medications = await kioskDataService.getMedications();
        setAvailableMedications(medications);
      } catch (error) {
        console.error('Error loading medications:', error);
        // Fallback to basic medications list
        setAvailableMedications([
          'Acetaminophen (Tylenol)',
          'Ibuprofen (Advil, Motrin)',
          'Aspirin',
          'Metformin',
          'Lisinopril',
          'Atorvastatin (Lipitor)',
          'Omeprazole (Prilosec)',
          'Levothyroxine (Synthroid)',
          'Amlodipine',
          'Metoprolol',
          'Hydrochlorothiazide',
          'Simvastatin',
          'Losartan',
          'Gabapentin',
          'Sertraline (Zoloft)',
          'Fluoxetine (Prozac)',
          'Escitalopram (Lexapro)',
          'Alprazolam (Xanax)',
          'Lorazepam (Ativan)',
          'Trazodone'
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, []);

  const handleNoMedicationsChange = (checked: boolean) => {
    setFormData({
      medications: checked ? [] : formData.medications,
      noMedications: checked
    });
    if (checked) {
      setErrors({});
    }
  };

  const handleAddMedication = (medicationName: string) => {
    if (!medicationName.trim()) return;

    // Check if medication already exists
    const exists = formData.medications.some(
      med => med.name.toLowerCase() === medicationName.toLowerCase()
    );

    if (exists) {
      setErrors({ duplicate: 'This medication is already in your list' });
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medicationName.trim(),
      dosage: '',
      frequency: '',
      prescribedBy: '',
      startDate: '',
      notes: ''
    };

    setFormData({
      ...formData,
      medications: [...formData.medications, newMedication],
      noMedications: false
    });

    setNewMedicationName('');
    setShowAddCustom(false);
    setErrors({});
  };

  const handleRemoveMedication = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter(med => med.id !== id)
    });
  };

  const handleMedicationDetailChange = (id: string, field: keyof Medication, value: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.map(med =>
        med.id === id ? { ...med, [field]: value } : med
      )
    });
  };

  const handleNext = () => {
    if (!formData.noMedications && formData.medications.length === 0) {
      setErrors({ medications: 'Please add at least one medication or check "No current medications"' });
      return;
    }

    // Validate medication details
    const medicationErrors: Record<string, string> = {};
    formData.medications.forEach((med, index) => {
      if (!med.dosage.trim()) {
        medicationErrors[`dosage_${index}`] = 'Dosage is required';
      }
      if (!med.frequency.trim()) {
        medicationErrors[`frequency_${index}`] = 'Frequency is required';
      }
    });

    if (Object.keys(medicationErrors).length > 0) {
      setErrors(medicationErrors);
      return;
    }

    setErrors({});
    onNext({ medications: formData.medications.map(med => med.name) });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Current Medications</h1>
        <p className="text-lg text-gray-600">
          Please list all medications you are currently taking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Medications Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* No Medications Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="noMedications"
              checked={formData.noMedications}
              onChange={(e) => handleNoMedicationsChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="noMedications" className="text-sm font-medium">
              I am not currently taking any medications
            </Label>
          </div>

          {!formData.noMedications && (
            <>
              {/* Add Medication Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Add Medication</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setShowAddCustom(true);
                        } else {
                          handleAddMedication(value);
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading medications..." : "Select a medication"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading medications...
                            </div>
                          </SelectItem>
                        ) : (
                          <>
                            {availableMedications.map((medication) => (
                              <SelectItem key={medication} value={medication}>
                                {medication}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add custom medication
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Medication Input */}
                {showAddCustom && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter medication name"
                      value={newMedicationName}
                      onChange={(e) => setNewMedicationName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMedication(newMedicationName);
                        }
                      }}
                    />
                    <Button onClick={() => handleAddMedication(newMedicationName)}>
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddCustom(false);
                      setNewMedicationName('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}

                {errors.duplicate && (
                  <p className="text-sm text-red-600">{errors.duplicate}</p>
                )}
                {errors.medications && (
                  <p className="text-sm text-red-600">{errors.medications}</p>
                )}
              </div>

              {/* Current Medications List */}
              {formData.medications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Medications</h3>
                  {formData.medications.map((medication, index) => (
                    <Card key={medication.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{medication.name}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMedication(medication.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Dosage *</Label>
                            <Input
                              placeholder="e.g., 10mg, 1 tablet"
                              value={medication.dosage}
                              onChange={(e) => handleMedicationDetailChange(medication.id, 'dosage', e.target.value)}
                              className={errors[`dosage_${index}`] ? 'border-red-300' : ''}
                            />
                            {errors[`dosage_${index}`] && (
                              <p className="text-sm text-red-600">{errors[`dosage_${index}`]}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Frequency *</Label>
                            <Select
                              value={medication.frequency}
                              onValueChange={(value) => handleMedicationDetailChange(medication.id, 'frequency', value)}
                            >
                              <SelectTrigger className={errors[`frequency_${index}`] ? 'border-red-300' : ''}>
                                <SelectValue placeholder="How often?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Once daily">Once daily</SelectItem>
                                <SelectItem value="Twice daily">Twice daily</SelectItem>
                                <SelectItem value="Three times daily">Three times daily</SelectItem>
                                <SelectItem value="Four times daily">Four times daily</SelectItem>
                                <SelectItem value="Every other day">Every other day</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="As needed">As needed</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors[`frequency_${index}`] && (
                              <p className="text-sm text-red-600">{errors[`frequency_${index}`]}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Prescribed By</Label>
                            <Input
                              placeholder="Doctor's name"
                              value={medication.prescribedBy}
                              onChange={(e) => handleMedicationDetailChange(medication.id, 'prescribedBy', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Start Date</Label>
                            <Input
                              type="date"
                              value={medication.startDate}
                              onChange={(e) => handleMedicationDetailChange(medication.id, 'startDate', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Notes</Label>
                          <Input
                            placeholder="Any additional notes..."
                            value={medication.notes}
                            onChange={(e) => handleMedicationDetailChange(medication.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
