import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Home, Save, Upload, Plus, Trash2, MapPin, Loader2, Edit2, X, Undo2, Download } from 'lucide-react';
import { toast } from 'sonner';

import { createPageUrl, getPolygonCentroid } from '@/utils';
import { mapStore } from '@/api/mapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const roundToTenth = (value) => Math.round(value * 10) / 10;

export default function CreateQuiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const imageRef = useRef(null);

  const [mapName, setMapName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [pins, setPins] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMapId, setEditingMapId] = useState(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinName, setNewPinName] = useState('');
  const [newPinType, setNewPinType] = useState('point');
  const [areaVertices, setAreaVertices] = useState([]);
  const [editingPinIndex, setEditingPinIndex] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: maps = [] } = useQuery({
    queryKey: ['maps'],
    queryFn: () => mapStore.list()
  });

  const createMapMutation = useMutation({
    mutationFn: (data) => mapStore.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz erfolgreich erstellt!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.message || 'Fehler beim Erstellen des Quiz');
    }
  });

  const updateMapMutation = useMutation({
    mutationFn: ({ id, data }) => mapStore.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz erfolgreich aktualisiert!');
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.message || 'Fehler beim Aktualisieren des Quiz');
    }
  });

  const deleteMapMutation = useMutation({
    mutationFn: (id) => mapStore.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      toast.success('Quiz gelöscht!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Fehler beim Löschen des Quiz');
    }
  });

  const getImageBox = () => {
    const container = mapContainerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    const img = imageRef.current;
    if (!img || !imageLoaded || !img.naturalWidth || !img.naturalHeight) {
      return { left: 0, top: 0, width: cw, height: ch, containerLeft: rect.left, containerTop: rect.top };
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const containerRatio = cw / ch;
    const imageRatio = iw / ih;

    let renderW = cw;
    let renderH = ch;
    if (imageRatio > containerRatio) {
      renderW = cw;
      renderH = cw / imageRatio;
    } else {
      renderH = ch;
      renderW = ch * imageRatio;
    }

    const left = (cw - renderW) / 2;
    const top = (ch - renderH) / 2;

    return { left, top, width: renderW, height: renderH, containerLeft: rect.left, containerTop: rect.top };
  };

  const imageBox = getImageBox();

  const toAbsolutePosition = (point) => {
    if (!imageBox || !point) return null;
    return {
      left: imageBox.left + (imageBox.width * (point.x || 0)) / 100,
      top: imageBox.top + (imageBox.height * (point.y || 0)) / 100
    };
  };

  const toPolygonPoints = (vertices = []) => {
    if (!imageBox || !vertices.length) return '';
    return vertices
      .map((vertex) => `${(imageBox.width * vertex.x) / 100},${(imageBox.height * vertex.y) / 100}`)
      .join(' ');
  };

  const loadAndCompressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIMENSION = 1600;
          const scale = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height, 1);
          const targetW = Math.round(img.width * scale);
          const targetH = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Convert to JPEG to reduce size; fallback to original data URL on failure.
          try {
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } catch (err) {
            console.error('Image compression failed, using original', err);
            resolve(reader.result);
          }
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const processed = await loadAndCompressImage(file);
      setImageBase64(processed);
      setImageLoaded(false);
      setPins([]);
      setIsAddingPin(false);
      setAreaVertices([]);
      toast.success('Bild wurde geladen und komprimiert');
    } catch (err) {
      console.error(err);
      toast.error('Bild konnte nicht verarbeitet werden');
    }
  };

  const startAddingPin = (type = 'point') => {
    if (!imageBase64) {
      toast.error('Bitte zuerst ein Kartenbild hochladen');
      return;
    }
    setIsAddingPin(true);
    setNewPinType(type);
    setAreaVertices([]);
    setNewPinName('');
  };

  const handleCancelAdd = () => {
    setIsAddingPin(false);
    setNewPinName('');
    setNewPinType('point');
    setAreaVertices([]);
  };

  const handleMapClick = (e) => {
    if (!isAddingPin || !imageBase64) return;

    const box = getImageBox();
    if (!box) return;

    const offsetX = e.clientX - box.containerLeft - box.left;
    const offsetY = e.clientY - box.containerTop - box.top;
    const x = Math.max(0, Math.min(100, (offsetX / box.width) * 100));
    const y = Math.max(0, Math.min(100, (offsetY / box.height) * 100));

    if (!newPinName.trim()) {
      toast.error('Bitte einen Namen für den Ort eingeben');
      return;
    }

    if (newPinType === 'point') {
      const newPin = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: newPinName.trim(),
        type: 'point',
        x: roundToTenth(x),
        y: roundToTenth(y)
      };
      setPins((prev) => [...prev, newPin]);
      setNewPinName('');
      setIsAddingPin(false);
      toast.success(`Punkt "${newPin.name}" hinzugefügt`);
      return;
    }

    setAreaVertices((prev) => [...prev, { x: roundToTenth(x), y: roundToTenth(y) }]);
  };

  const handleUndoVertex = () => {
    setAreaVertices((prev) => prev.slice(0, -1));
  };

  const handleSaveArea = () => {
    if (!newPinName.trim()) {
      toast.error('Bitte einen Namen für die Fläche eingeben');
      return;
    }
    if (areaVertices.length < 3) {
      toast.error('Eine Fläche benötigt mindestens drei Punkte');
      return;
    }

    const newPin = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: newPinName.trim(),
      type: 'area',
      vertices: areaVertices
    };
    setPins((prev) => [...prev, newPin]);
    setNewPinName('');
    setAreaVertices([]);
    setIsAddingPin(false);
    toast.success(`Fläche "${newPin.name}" hinzugefügt`);
  };

  const handleRemovePin = (index) => {
    setPins((prev) => prev.filter((_, i) => i !== index));
    toast.success('Ort entfernt');
  };

  const handleEditPin = (index) => {
    setEditingPinIndex(index);
  };

  const handleUpdatePinName = (index, newName) => {
    setPins((prev) =>
      prev.map((pin, i) => (i === index ? { ...pin, name: newName } : pin))
    );
  };

  const handleFinishPinEdit = () => {
    setEditingPinIndex(null);
    toast.success('Ort aktualisiert');
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
      toast.error('Bitte mindestens einen Ort hinzufügen');
      return;
    }

    const data = {
      name: mapName.trim(),
      imageBase64,
      pins
    };

    if (isEditing && editingMapId) {
      updateMapMutation.mutate({ id: editingMapId, data });
    } else {
      createMapMutation.mutate(data);
    }
  };

  const handleExport = () => {
    if (!isEditing) {
      toast.error('Export ist nur im Bearbeitungsmodus verfügbar');
      return;
    }

    if (!mapName.trim() || !imageBase64 || pins.length === 0) {
      toast.error('Bitte stelle sicher, dass Name, Bild und Orte vorhanden sind');
      return;
    }

    try {
      const safeName =
        mapName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-_]/g, '') || 'quiz-map';

      const payload = {
        id: editingMapId,
        name: mapName.trim(),
        imageBase64,
        pins,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Karte exportiert');
    } catch (err) {
      console.error(err);
      toast.error('Export fehlgeschlagen');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || typeof data !== 'object') throw new Error('Ungültige Datei');
      if (!data.name || !data.imageBase64 || !Array.isArray(data.pins)) {
        throw new Error('Name, Bild und Orte werden benötigt');
      }

      const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) * 10) / 10));

      const normalizedPins = data.pins
        .map((pin) => {
          if (!pin || !pin.type) return null;
          if (pin.type === 'area') {
            return {
              id: pin.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              name: pin.name || 'Unbenannte Fläche',
              type: 'area',
              vertices: Array.isArray(pin.vertices)
                ? pin.vertices
                    .map((v) => ({ x: clamp(v.x), y: clamp(v.y) }))
                    .filter((v) => !Number.isNaN(v.x) && !Number.isNaN(v.y))
                : []
            };
          }
          return {
            id: pin.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: pin.name || 'Unbenannter Punkt',
            type: 'point',
            x: clamp(pin.x),
            y: clamp(pin.y)
          };
        })
        .filter(Boolean);

      if (!normalizedPins.length) {
        throw new Error('Keine gültigen Orte gefunden');
      }

      setMapName(data.name);
      setImageBase64(data.imageBase64);
      setPins(normalizedPins);
      setIsEditing(false);
      setEditingMapId(null);
      setImageLoaded(false);
      setIsAddingPin(false);
      setNewPinName('');
      setAreaVertices([]);
      setEditingPinIndex(null);
      toast.success('Karte importiert – bitte speichern');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Import fehlgeschlagen');
    } finally {
      // reset input so the same file can be re-imported if needed
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleEdit = (map) => {
    setMapName(map.name);
    setImageBase64(map.imageBase64);
    setPins(map.pins || []);
    setIsEditing(true);
    setEditingMapId(map.id);
    setImageLoaded(false);
    setIsAddingPin(false);
    setNewPinName('');
    setAreaVertices([]);
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
    setAreaVertices([]);
    setEditingPinIndex(null);
    setImageLoaded(false);
  };

  const renderAreaPreview = (vertices, color) => {
    if (!imageBox || vertices.length < 2) return null;
    const points = toPolygonPoints(vertices);
    if (!points) return null;

    return (
      <svg
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${imageBox.left}px`,
          top: `${imageBox.top}px`,
          width: `${imageBox.width}px`,
          height: `${imageBox.height}px`
        }}
      >
        <polygon
          points={points}
          fill={color.fill}
          stroke={color.stroke}
          strokeWidth={2}
          fillOpacity={color.fillOpacity ?? 0.16}
        />
      </svg>
    );
  };

  const renderPinOverlay = (pin, index) => {
    if (!imageLoaded || !imageBox) return null;

    if (pin.type === 'area' && Array.isArray(pin.vertices)) {
      const center = getPolygonCentroid(pin.vertices);
      const centerPos = center ? toAbsolutePosition(center) : null;
      return (
        <React.Fragment key={pin.id || index}>
          {renderAreaPreview(pin.vertices, {
            fill: 'rgb(59 130 246 / 0.14)',
            stroke: '#2563eb'
          })}
          {centerPos && (
            <div
              className="absolute z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded shadow"
              style={{
                left: `${centerPos.left}px`,
                top: `${centerPos.top}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {pin.name}
            </div>
          )}
        </React.Fragment>
      );
    }

    const pos = toAbsolutePosition(pin);
    if (!pos) return null;

    return (
      <motion.div
        key={pin.id || index}
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        className="absolute z-20"
        style={{
          left: `${pos.left}px`,
          top: `${pos.top}px`,
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl dark:bg-blue-900/30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl dark:bg-indigo-900/30" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-10">
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
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Quiz bearbeiten' : 'Neues Quiz erstellen'}
              </h1>
              <p className="text-slate-500 dark:text-slate-300">Erstelle interaktive Karten-Quiz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => importInputRef.current?.click()}
              className="rounded-xl"
            >
              <Upload className="w-4 h-4 mr-2" />
              Karte importieren
            </Button>
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Karte exportieren
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Abbrechen
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
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
                    placeholder="z.B. Länder Europas"
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

            <Card className="shadow-lg border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Orte hinzufügen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAddingPin ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => startAddingPin('point')}
                      disabled={!imageBase64}
                      className="h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Punkt setzen
                    </Button>
                    <Button
                      onClick={() => startAddingPin('area')}
                      disabled={!imageBase64}
                      variant="outline"
                      className="h-12 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Fläche zeichnen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={newPinType === 'point' ? 'default' : 'outline'}
                        onClick={() => {
                          setNewPinType('point');
                          setAreaVertices([]);
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Punkt
                      </Button>
                      <Button
                        variant={newPinType === 'area' ? 'default' : 'outline'}
                        onClick={() => {
                          setNewPinType('area');
                          setAreaVertices([]);
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Fläche
                      </Button>
                    </div>
                    <Input
                      value={newPinName}
                      onChange={(e) => setNewPinName(e.target.value)}
                      placeholder="Name des Ortes"
                      className="rounded-xl"
                      autoFocus
                    />
                    {newPinType === 'area' ? (
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>Klicke mindestens drei Punkte auf der Karte, um die Fläche zu schließen.</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUndoVertex}
                            disabled={areaVertices.length === 0}
                            className="rounded-lg"
                          >
                            <Undo2 className="w-3 h-3 mr-1" />
                            Schritt zurück
                          </Button>
                          <span className="text-xs text-slate-500">
                            Punkte gesetzt: {areaVertices.length}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Klicke auf die Karte, um den Punkt zu platzieren.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelAdd}
                        className="flex-1 rounded-xl"
                      >
                        Abbrechen
                      </Button>
                      {newPinType === 'area' && (
                        <Button
                          onClick={handleSaveArea}
                          disabled={!newPinName.trim() || areaVertices.length < 3}
                          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        >
                          Fläche speichern
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {pins.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      Orte ({pins.length})
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {pins.map((pin, index) => (
                        <div
                          key={pin.id}
                          className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white border text-slate-600">
                              {pin.type === 'area' ? 'Fläche' : 'Punkt'}
                            </span>
                            {editingPinIndex === index ? (
                              <Input
                                value={pin.name}
                                onChange={(e) => handleUpdatePinName(index, e.target.value)}
                                onBlur={handleFinishPinEdit}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium text-slate-700">
                                {pin.name}
                              </span>
                            )}
                          </div>
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
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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

          <div className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapContainerRef}
                  onClick={handleMapClick}
                  className={`relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden ${
                    isAddingPin ? 'cursor-crosshair' : ''
                  }`}
                >
                  {imageBase64 ? (
                    <>
                      <img
                        ref={imageRef}
                        src={imageBase64}
                        alt="Karte Vorschau"
                        className="w-full h-full object-contain"
                        onLoad={() => setImageLoaded(true)}
                        draggable={false}
                      />
                      {isAddingPin && newPinType === 'area' && areaVertices.length > 0 && renderAreaPreview(areaVertices, {
                        fill: 'rgb(37 99 235 / 0.12)',
                        stroke: '#1d4ed8'
                      })}
                      {pins.map((pin, index) => renderPinOverlay(pin, index))}
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
                    {map.pins?.length || 0} Orte
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

