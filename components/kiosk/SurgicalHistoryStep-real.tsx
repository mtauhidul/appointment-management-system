'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StepComponentProps } from '@/lib/types/kiosk';
import { ArrowLeft, ArrowRight, Scissors, Trash2, Plus, Loader2 } from 'lucide-react';
import kioskDataService from '@/lib/services/kiosk-data-service';

interface Surgery {
  id: string;
  name: string;
  date: string;
  surgeon: string;
  hospital: string;
  complications: string;
  notes: string;
}

export default function SurgicalHistoryStepReal({ data, onNext, onBack }: StepComponentProps) {
  const [formData, setFormData] = useState<{ surgeries: Surgery[]; noSurgeries: boolean }>({
    surgeries: data.surgicalHistory ? data.surgicalHistory.map((surgery: string, index: number) => ({
      id: `surgery_${index}`,
      name: surgery,
      date: '',
      surgeon: '',
      hospital: '',
      complications: '',
      notes: ''
    })) : [],
    noSurgeries: !data.surgicalHistory || data.surgicalHistory.length === 0
  });

  const [availableProcedures, setAvailableProcedures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newProcedureName, setNewProcedureName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Load available surgical procedures from Firestore
  useEffect(() => {
    const loadProcedures = async () => {
      try {
        setLoading(true);
        const procedures = await kioskDataService.getProcedures();
        setAvailableProcedures(procedures);
      } catch (error) {
        console.error('Error loading surgical procedures:', error);
        // Fallback to basic procedures list
        setAvailableProcedures([
          'Appendectomy',
          'Gallbladder Surgery (Cholecystectomy)',
          'Hernia Repair',
          'Cataract Surgery',
          'Knee Replacement',
          'Hip Replacement',
          'Coronary Bypass Surgery',
          'Angioplasty',
          'Tonsillectomy',
          'Hysterectomy',
          'Cesarean Section',
          'Arthroscopy',
          'Carpal Tunnel Surgery',
          'Thyroid Surgery',
          'Prostate Surgery',
          'Skin Cancer Removal',
          'Wisdom Teeth Removal',
          'Colonoscopy (with polyp removal)',
          'Gastric Bypass',
          'Spinal Fusion'
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, []);

  const handleNoSurgeriesChange = (checked: boolean) => {
    setFormData({
      surgeries: checked ? [] : formData.surgeries,
      noSurgeries: checked
    });
    if (checked) {
      setErrors({});
    }
  };

  const handleAddSurgery = (surgeryName: string) => {
    if (!surgeryName.trim()) return;

    // Check if surgery already exists
    const exists = formData.surgeries.some(
      surgery => surgery.name.toLowerCase() === surgeryName.toLowerCase()
    );

    if (exists) {
      setErrors({ duplicate: 'This surgical procedure is already in your list' });
      return;
    }

    const newSurgery: Surgery = {
      id: Date.now().toString(),
      name: surgeryName.trim(),
      date: '',
      surgeon: '',
      hospital: '',
      complications: '',
      notes: ''
    };

    setFormData({
      ...formData,
      surgeries: [...formData.surgeries, newSurgery],
      noSurgeries: false
    });

    setNewProcedureName('');
    setShowAddCustom(false);
    setErrors({});
  };

  const handleRemoveSurgery = (id: string) => {
    setFormData({
      ...formData,
      surgeries: formData.surgeries.filter(surgery => surgery.id !== id)
    });
  };

  const handleSurgeryDetailChange = (id: string, field: keyof Surgery, value: string) => {
    setFormData({
      ...formData,
      surgeries: formData.surgeries.map(surgery =>
        surgery.id === id ? { ...surgery, [field]: value } : surgery
      )
    });
  };

  const handleNext = () => {
    if (!formData.noSurgeries && formData.surgeries.length === 0) {
      setErrors({ surgeries: 'Please add at least one surgical procedure or check "No surgical history"' });
      return;
    }

    // Validate surgery details
    const surgeryErrors: Record<string, string> = {};
    formData.surgeries.forEach((surgery, index) => {
      if (!surgery.date.trim()) {
        surgeryErrors[`date_${index}`] = 'Surgery date is required';
      }
    });

    if (Object.keys(surgeryErrors).length > 0) {
      setErrors(surgeryErrors);
      return;
    }

    setErrors({});
    onNext({ surgicalHistory: formData.surgeries.map(surgery => surgery.name) });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Surgical History</h1>
        <p className="text-lg text-gray-600">
          Please list any surgeries or procedures you have had
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Surgical History Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* No Surgeries Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="noSurgeries"
              checked={formData.noSurgeries}
              onChange={(e) => handleNoSurgeriesChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="noSurgeries" className="text-sm font-medium">
              I have no surgical history
            </Label>
          </div>

          {!formData.noSurgeries && (
            <>
              {/* Add Surgery Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Add Surgical Procedure</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setShowAddCustom(true);
                        } else {
                          handleAddSurgery(value);
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading procedures..." : "Select a procedure"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading procedures...
                            </div>
                          </SelectItem>
                        ) : (
                          <>
                            {availableProcedures.map((procedure) => (
                              <SelectItem key={procedure} value={procedure}>
                                {procedure}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add custom procedure
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Procedure Input */}
                {showAddCustom && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter procedure name"
                      value={newProcedureName}
                      onChange={(e) => setNewProcedureName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSurgery(newProcedureName);
                        }
                      }}
                    />
                    <Button onClick={() => handleAddSurgery(newProcedureName)}>
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddCustom(false);
                      setNewProcedureName('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}

                {errors.duplicate && (
                  <p className="text-sm text-red-600">{errors.duplicate}</p>
                )}
                {errors.surgeries && (
                  <p className="text-sm text-red-600">{errors.surgeries}</p>
                )}
              </div>

              {/* Current Surgeries List */}
              {formData.surgeries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Surgical History</h3>
                  {formData.surgeries.map((surgery, index) => (
                    <Card key={surgery.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{surgery.name}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSurgery(surgery.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Date of Surgery *</Label>
                            <Input
                              type="date"
                              value={surgery.date}
                              onChange={(e) => handleSurgeryDetailChange(surgery.id, 'date', e.target.value)}
                              className={errors[`date_${index}`] ? 'border-red-300' : ''}
                            />
                            {errors[`date_${index}`] && (
                              <p className="text-sm text-red-600">{errors[`date_${index}`]}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Surgeon</Label>
                            <Input
                              placeholder="Doctor's name"
                              value={surgery.surgeon}
                              onChange={(e) => handleSurgeryDetailChange(surgery.id, 'surgeon', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Hospital/Facility</Label>
                            <Input
                              placeholder="Name of hospital or clinic"
                              value={surgery.hospital}
                              onChange={(e) => handleSurgeryDetailChange(surgery.id, 'hospital', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Complications</Label>
                            <Select
                              value={surgery.complications}
                              onValueChange={(value) => handleSurgeryDetailChange(surgery.id, 'complications', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any complications?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No complications</SelectItem>
                                <SelectItem value="minor">Minor complications</SelectItem>
                                <SelectItem value="major">Major complications</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Additional Notes</Label>
                          <Textarea
                            placeholder="Any additional details about the surgery..."
                            value={surgery.notes}
                            onChange={(e) => handleSurgeryDetailChange(surgery.id, 'notes', e.target.value)}
                            rows={3}
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
