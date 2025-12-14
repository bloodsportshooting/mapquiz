import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Home, Save, Upload, Plus, Trash2, MapPin, Loader2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [mapName, setMapName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [pins, setPins] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMapId, setEditingMapId] = useState(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinName, setNewPinName] = useState('');
  const [editingPinIndex, setEditingPinIndex] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: maps = [] } = useQuery({
    queryKey: ['maps'],
    queryFn: () => base44.entities.Map.list(),
  });

  const createMapMutation = useMutation({
    mutationFn: (data) => base44.entities.Map.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz erfolgreich erstellt!');
      resetForm();
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Quiz');
    }
  });

  const updateMapMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Map.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz erfolgreich aktualisiert!');
      resetForm();
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Quiz');
    }
  });

  const deleteMapMutation = useMutation({
    mutationFn: (id) => base44.entities.Map.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz gelöscht!');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Quiz');
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target.result);
      setImageLoaded(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMapClick = (e) => {
    if (!isAddingPin || !imageBase64 || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (newPinName.trim()) {
      const newPin = {
        id: Date.now(),
        name: newPinName,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      };
      setPins([...pins, newPin]);
      setNewPinName('');
      setIsAddingPin(false);
      toast.success(`Pin "${newPinName}" hinzugefügt`);
    }
  };

  const handleRemovePin = (index) => {
    setPins(pins.filter((_, i) => i !== index));
    toast.success('Pin entfernt');
  };

  const handleEditPin = (index) => {
    setEditingPinIndex(index);
  };

  const handleUpdatePinName = (index, newName) => {
    const updatedPins = [...pins];
    updatedPins[index].name = newName;
    setPins(updatedPins);
    setEditingPinIndex(null);
    toast.success('Pin aktualisiert');
  };

  const handleSave = () => {
    if (!mapName.trim()) {
      toast.error('Bitte einen Namen eingeben');
      return;
    }
    if (!imageBase64) {
      toast.error('Bitte ein Kartenbild hochladen');
      return;
    }
    if (pins.length === 0) {
      toast.error('Bitte mindestens einen Pin hinzufügen');
      return;
    }

    const data = {
      name: mapName,
      imageBase64,
      pins
    };

    if (isEditing && editingMapId) {
      updateMapMutation.mutate({ id: editingMapId, data });
    } else {
      createMapMutation.mutate(data);
    }
  };

  const handleEdit = (map) => {
    setMapName(map.name);
    setImageBase64(map.imageBase64);
    setPins(map.pins || []);
    setIsEditing(true);
    setEditingMapId(map.id);
    setImageLoaded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setMapName('');
    setImageBase64('');
    setPins([]);
    setIsEditing(false);
    setEditingMapId(null);
    setIsAddingPin(false);
    setNewPinName('');
    setEditingPinIndex(null);
    setImageLoaded(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Home'))}
              className="rounded-xl hover:bg-slate-100"
            >
              <Home className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {isEditing ? 'Quiz bearbeiten' : 'Neues Quiz erstellen'}
              </h1>
              <p className="text-slate-500">Erstelle interaktive Karten-Quiz</p>
            </div>
          </div>
          {isEditing && (
            <Button
              variant="outline"
              onClick={resetForm}
              className="rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Map Name */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Quiz-Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mapName">Name der Karte</Label>
                  <Input
                    id="mapName"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    placeholder="z.B. Deutschland - Städte"
                    className="mt-2 rounded-xl"
                  />
                </div>

                <div>
                  <Label>Kartenbild</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 rounded-xl h-12"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageBase64 ? 'Bild ändern' : 'Bild hochladen'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Pin */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Pins hinzufügen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAddingPin ? (
                  <Button
                    onClick={() => setIsAddingPin(true)}
                    disabled={!imageBase64}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neuen Pin hinzufügen
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Input
                      value={newPinName}
                      onChange={(e) => setNewPinName(e.target.value)}
                      placeholder="Name des Ortes"
                      className="rounded-xl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPin(false);
                          setNewPinName('');
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Abbrechen
                      </Button>
                      <Button
                        disabled={!newPinName.trim()}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      >
                        Auf Karte klicken
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500 text-center">
                      Klicke auf die Karte, um den Pin zu platzieren
                    </p>
                  </div>
                )}

                {/* Pin List */}
                {pins.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      Pins ({pins.length})
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {pins.map((pin, index) => (
                        <div
                          key={pin.id}
                          className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl"
                        >
                          <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          {editingPinIndex === index ? (
                            <Input
                              value={pin.name}
                              onChange={(e) => handleUpdatePinName(index, e.target.value)}
                              onBlur={() => setEditingPinIndex(null)}
                              className="flex-1 h-8 text-sm"
                              autoFocus
                            />
                          ) : (
                            <span className="flex-1 text-sm font-medium text-slate-700">
                              {pin.name}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPin(index)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePin(index)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={createMapMutation.isPending || updateMapMutation.isPending}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg shadow-lg shadow-blue-500/30"
            >
              {createMapMutation.isPending || updateMapMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Quiz aktualisieren' : 'Quiz speichern'}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapContainerRef}
                  onClick={handleMapClick}
                  className={`relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden ${
                    isAddingPin && newPinName ? 'cursor-crosshair' : ''
                  }`}
                >
                  {imageBase64 ? (
                    <>
                      <img
                        src={imageBase64}
                        alt="Karte Vorschau"
                        className="w-full h-full object-contain"
                        onLoad={() => setImageLoaded(true)}
                        draggable={false}
                      />
                      {imageLoaded && pins.map((pin) => (
                        <motion.div
                          key={pin.id}
                          initial={{ scale: 0, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          className="absolute z-10"
                          style={{
                            left: `${pin.x}%`,
                            top: `${pin.y}%`,
                            transform: 'translate(-50%, -100%)'
                          }}
                        >
                          <MapPin
                            className="w-8 h-8 text-rose-500 drop-shadow-lg"
                            fill="currentColor"
                            strokeWidth={1.5}
                          />
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap">
                            {pin.name}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Lade ein Kartenbild hoch</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Existing Maps */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Vorhandene Quiz</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <Card key={map.id} className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={map.imageBase64?.startsWith('data:') ? map.imageBase64 : `data:image/png;base64,${map.imageBase64}`}
                      alt={map.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{map.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {map.pins?.length || 0} Pins
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(map)}
                      className="flex-1 rounded-lg"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Quiz "${map.name}" wirklich löschen?`)) {
                          deleteMapMutation.mutate(map.id);
                        }
                      }}
                      className="rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}