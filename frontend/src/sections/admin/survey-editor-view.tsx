import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Alert,
  Button,
  Dialog,
  Switch,
  Divider,
  Checkbox,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  FormControlLabel,
  CircularProgress,
  Radio,
  RadioGroup,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { userService } from 'src/services/userService';
import { surveyService } from 'src/services/surveyService';
import type { UserResponse } from 'src/types/user';
import type {
  Survey,
  SurveyForm,
  SurveySection,
  SurveyQuestion,
} from 'src/types/survey';

// ----------------------------------------------------------------------

const DEFAULT_SCALE: Record<string, string> = {
  '1': 'Totalmente en desacuerdo',
  '2': 'En desacuerdo',
  '3': 'Ni de acuerdo ni en desacuerdo',
  '4': 'De acuerdo',
  '5': 'Totalmente de acuerdo',
};

type AssignmentMode = 'NONE' | 'ALL' | 'SELECTED';

interface SurveyEditorViewProps {
  surveyToEdit?: Survey | null;
  existingAssignedUserIds?: string[];
  onCancel: () => void;
  onSaved: (surveyId: string, message: string) => void;
  onDeleted?: (deletedSurveyId: string, message: string) => void;
}

export function SurveyEditorView({
  surveyToEdit,
  existingAssignedUserIds = [],
  onCancel,
  onSaved,
  onDeleted,
}: SurveyEditorViewProps) {
  const isEditing = Boolean(surveyToEdit);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [scale, setScale] = useState<Record<string, string>>({ ...DEFAULT_SCALE });
  const [sections, setSections] = useState<SurveySection[]>([
    {
      id: 'seccion_1',
      title: 'Usabilidad',
      questions: [
        {
          id: 'P1',
          text: '',
          type: 'rating',
          required: true,
        },
      ],
    },
  ]);
  const [finalCommentEnabled, setFinalCommentEnabled] = useState(true);
  const [finalCommentLabel, setFinalCommentLabel] = useState('Comentarios finales');
  const [finalCommentRequired, setFinalCommentRequired] = useState(false);

  // Assignment state
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>(
    isEditing ? 'NONE' : 'ALL'
  );
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing survey data if editing
  useEffect(() => {
    if (!surveyToEdit) return;

    setName(surveyToEdit.name || '');
    setDescription(surveyToEdit.description || '');
    setActive(surveyToEdit.active ?? true);

    if (surveyToEdit.formJson) {
      try {
        const parsed = JSON.parse(surveyToEdit.formJson) as SurveyForm;
        if (parsed.scale) {
          setScale({ ...DEFAULT_SCALE, ...parsed.scale });
        }
        if (parsed.sections && parsed.sections.length > 0) {
          setSections(
            parsed.sections.map((sec, idx) => ({
              id: sec.id || `seccion_${idx + 1}`,
              title: sec.title || `Sección ${idx + 1}`,
              questions: (sec.questions || []).map((q, qIdx) => ({
                id: q.id || `P${qIdx + 1}`,
                text: q.text || '',
                type: 'rating',
                required: q.required ?? true,
              })),
            }))
          );
        } else if (parsed.questions && parsed.questions.length > 0) {
          // Group flat questions by section if present
          const grouped = new Map<string, SurveyQuestion[]>();
          parsed.questions.forEach((q) => {
            const secTitle = q.section || 'Preguntas Generales';
            const list = grouped.get(secTitle) || [];
            list.push({
              id: q.id,
              text: q.text,
              type: 'rating',
              required: q.required ?? true,
            });
            grouped.set(secTitle, list);
          });
          setSections(
            Array.from(grouped.entries()).map(([title, qs], idx) => ({
              id: `seccion_${idx + 1}`,
              title,
              questions: qs,
            }))
          );
        }
        if (parsed.finalComment) {
          setFinalCommentEnabled(parsed.finalComment.enabled ?? true);
          setFinalCommentLabel(parsed.finalComment.label || 'Comentarios finales');
          setFinalCommentRequired(parsed.finalComment.required ?? false);
        }
      } catch (e) {
        console.error('Error parsing survey formJson:', e);
      }
    }
  }, [surveyToEdit]);

  // Load active users for assignment selector
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const allUsers = await userService.getUsers();
        setUsers(allUsers.filter((u) => u.active));
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedUserIds(existingAssignedUserIds);
  }, [existingAssignedUserIds]);

  const alreadyAssignedSet = useMemo(
    () => new Set(existingAssignedUserIds),
    [existingAssignedUserIds]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
        const q = userSearch.trim().toLowerCase();
        const matchesSearch =
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
      }),
    [users, userRoleFilter, userSearch]
  );

  // Section & Question handlers
  const handleAddSection = () => {
    const nextIdx = sections.length + 1;
    setSections((prev) => [
      ...prev,
      {
        id: `seccion_${Date.now()}`,
        title: `Nueva Sección ${nextIdx}`,
        questions: [
          {
            id: `S${nextIdx}_1`,
            text: '',
            type: 'rating',
            required: true,
          },
        ],
      },
    ]);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIndex));
  };

  const handleSectionTitleChange = (sectionIndex: number, newTitle: string) => {
    setSections((prev) =>
      prev.map((sec, idx) => (idx === sectionIndex ? { ...sec, title: newTitle } : sec))
    );
  };

  const handleAddQuestion = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        const prefix = sec.title ? sec.title.charAt(0).toUpperCase() : 'P';
        const nextNum = sec.questions.length + 1;
        return {
          ...sec,
          questions: [
            ...sec.questions,
            {
              id: `${prefix}${nextNum}`,
              text: '',
              type: 'rating',
              required: true,
            },
          ],
        };
      })
    );
  };

  const handleRemoveQuestion = (sectionIndex: number, questionIndex: number) => {
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        if (sec.questions.length <= 1) return sec;
        return {
          ...sec,
          questions: sec.questions.filter((_, qIdx) => qIdx !== questionIndex),
        };
      })
    );
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    field: keyof SurveyQuestion,
    value: any
  ) => {
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q, qIdx) =>
            qIdx === questionIndex ? { ...q, [field]: value } : q
          ),
        };
      })
    );
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllFiltered = () => {
    const selectableIds = filteredUsers.map((u) => u.id);
    const allSelected = selectableIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !selectableIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...selectableIds])));
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'El nombre de la encuesta es obligatorio.';
    }
    if (sections.length === 0) {
      return 'Debes agregar al menos una sección.';
    }
    const allIds = new Set<string>();
    for (const sec of sections) {
      if (!sec.title.trim()) {
        return 'Todas las secciones deben tener un título.';
      }
      if (sec.questions.length === 0) {
        return `La sección "${sec.title}" debe tener al menos una pregunta.`;
      }
      for (const q of sec.questions) {
        if (!q.id.trim()) {
          return `Todas las preguntas de "${sec.title}" deben tener un código (ej. U1).`;
        }
        if (allIds.has(q.id.trim())) {
          return `El código de pregunta "${q.id.trim()}" está duplicado. Cada pregunta debe tener un código único.`;
        }
        allIds.add(q.id.trim());
        if (!q.text.trim()) {
          return `La pregunta "${q.id}" en la sección "${sec.title}" no tiene texto.`;
        }
      }
    }
    if (!isEditing && assignmentMode === 'SELECTED' && selectedUserIds.length === 0) {
      return 'Selecciona al menos un usuario para asignar la encuesta o cambia la opción de asignación.';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const normalizedSections: SurveySection[] = sections.map((sec, idx) => ({
        id: sec.id || `seccion_${idx + 1}`,
        title: sec.title.trim(),
        questions: sec.questions.map((q) => ({
          id: q.id.trim(),
          text: q.text.trim(),
          type: 'rating',
          required: Boolean(q.required),
        })),
      }));

      const flattenedQuestions: SurveyQuestion[] = normalizedSections.flatMap((sec) =>
        sec.questions.map((q) => ({
          ...q,
          section: sec.title,
        }))
      );

      const formPayload: SurveyForm = {
        title: name.trim(),
        description: description.trim() || undefined,
        scale,
        sections: normalizedSections,
        questions: flattenedQuestions,
        finalComment: {
          enabled: finalCommentEnabled,
          label: finalCommentLabel.trim() || 'Comentarios finales',
          required: finalCommentRequired,
        },
      };

      const formJsonString = JSON.stringify(formPayload);

      let savedSurvey: Survey;
      if (isEditing && surveyToEdit) {
        savedSurvey = await surveyService.updateSurvey(surveyToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          formJson: formJsonString,
          active,
        });
      } else {
        savedSurvey = await surveyService.createSurvey({
          name: name.trim(),
          description: description.trim(),
          formJson: formJsonString,
        });
      }

      if (assignmentMode === 'ALL') {
        await surveyService.assignSurvey(savedSurvey.id, {
          assignToAll: true,
        });
      } else if (assignmentMode === 'SELECTED') {
        await surveyService.assignSurvey(savedSurvey.id, {
          assignToAll: false,
          userIds: selectedUserIds,
        });
      }

      const actionLabel = isEditing ? 'actualizada' : 'creada';
      const assignInfo =
        assignmentMode !== 'NONE'
          ? ' Se actualizaron las asignaciones de usuarios.'
          : '';

      onSaved(savedSurvey.id, `Encuesta ${actionLabel} correctamente.${assignInfo}`);
    } catch (err) {
      console.error('Error saving survey:', err);
      setError('Ocurrió un error al guardar la encuesta. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!surveyToEdit) return;
    try {
      setDeleting(true);
      setError(null);
      await surveyService.deleteSurvey(surveyToEdit.id);
      setDeleteDialogOpen(false);
      if (onDeleted) {
        onDeleted(
          surveyToEdit.id,
          `La encuesta "${surveyToEdit.name}" fue eliminada junto con todas sus asignaciones y resultados.`
        );
      } else {
        onCancel();
      }
    } catch (err) {
      console.error('Error deleting survey:', err);
      setDeleteDialogOpen(false);
      setError('Ocurrió un error al eliminar la encuesta. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">
            {isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura las dimensiones, preguntas de calificación (1 a 5) y los usuarios a quienes se asignará
          </Typography>
        </Box>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Volver a listado
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 1. Datos Generales */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1. Información General
          </Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: isEditing ? 9 : 12 }}>
              <TextField
                fullWidth
                label="Nombre de la encuesta *"
                placeholder="Ej. Experiencia de usuario en la plataforma web"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            {isEditing && (
              <Grid
                size={{ xs: 12, md: 3 }}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      color="success"
                    />
                  }
                  label={active ? 'Encuesta Activa' : 'Encuesta Inactiva'}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción / Instrucciones"
                placeholder="Instrucciones que verá el usuario al abrir el cuestionario..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. Escala de calificación */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            2. Escala de Calificación (1 a 5)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define las etiquetas para cada valor de la escala de calificación
          </Typography>
          <Grid container spacing={2}>
            {['1', '2', '3', '4', '5'].map((key) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={key}>
                <TextField
                  fullWidth
                  size="small"
                  label={`Valor ${key}`}
                  value={scale[key] || ''}
                  onChange={(e) =>
                    setScale((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 3. Secciones y Preguntas */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6">3. Secciones y Preguntas</Typography>
            <Typography variant="body2" color="text.secondary">
              Organiza el cuestionario por dimensiones (ej. Usabilidad, Accesibilidad, Disponibilidad)
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:add-bold" />}
            onClick={handleAddSection}
          >
            Agregar sección
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {sections.map((section, sIdx) => (
            <Card key={section.id} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2.5,
                  }}
                >
                  <Chip
                    label={`Sección ${sIdx + 1}`}
                    color="primary"
                    size="small"
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Nombre de la sección / dimensión *"
                    placeholder="Ej. Usabilidad"
                    value={section.title}
                    onChange={(e) =>
                      handleSectionTitleChange(sIdx, e.target.value)
                    }
                  />
                  {sections.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveSection(sIdx)}
                      title="Eliminar sección"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {section.questions.map((question, qIdx) => (
                    <Box
                      key={qIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Código"
                        placeholder="U1"
                        value={question.id}
                        onChange={(e) =>
                          handleQuestionChange(sIdx, qIdx, 'id', e.target.value)
                        }
                        sx={{ width: 95, flexShrink: 0 }}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        label={`Pregunta ${qIdx + 1}`}
                        placeholder="Escribe la pregunta aquí..."
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            sIdx,
                            qIdx,
                            'text',
                            e.target.value
                          )
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={question.required ?? true}
                            onChange={(e) =>
                              handleQuestionChange(
                                sIdx,
                                qIdx,
                                'required',
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Typography variant="caption">Obligatoria</Typography>
                        }
                        sx={{ ml: 0.5, mr: 0, flexShrink: 0 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        disabled={section.questions.length <= 1}
                        onClick={() => handleRemoveQuestion(sIdx, qIdx)}
                        title="Eliminar pregunta"
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                <Button
                  size="small"
                  variant="text"
                  startIcon={<Iconify icon="solar:add-bold" />}
                  onClick={() => handleAddQuestion(sIdx)}
                  sx={{ mt: 1.5 }}
                >
                  Agregar pregunta en {section.title || 'esta sección'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* 4. Comentarios Finales */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">4. Comentarios Finales</Typography>
              <Typography variant="body2" color="text.secondary">
                Campo de texto libre al final de la encuesta
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={finalCommentEnabled}
                  onChange={(e) => setFinalCommentEnabled(e.target.checked)}
                />
              }
              label="Habilitar comentarios finales"
            />
          </Box>

          {finalCommentEnabled && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Etiqueta del campo de comentarios"
                  value={finalCommentLabel}
                  onChange={(e) => setFinalCommentLabel(e.target.value)}
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 4 }}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={finalCommentRequired}
                      onChange={(e) =>
                        setFinalCommentRequired(e.target.checked)
                      }
                    />
                  }
                  label="Comentario obligatorio"
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* 5. Asignación de Usuarios */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            5. Asignación de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elige si deseas asignar esta encuesta a todos los usuarios activos o solo a usuarios específicos
          </Typography>

          <RadioGroup
            value={assignmentMode}
            onChange={(e) =>
              setAssignmentMode(e.target.value as AssignmentMode)
            }
          >
            <FormControlLabel
              value="ALL"
              control={<Radio />}
              label="Asignar a todos los usuarios activos"
            />
            <FormControlLabel
              value="SELECTED"
              control={<Radio />}
              label="Asignar solo a ciertos usuarios seleccionados"
            />
            <FormControlLabel
              value="NONE"
              control={<Radio />}
              label={
                isEditing
                  ? 'No agregar nuevas asignaciones por ahora (mantener asignaciones actuales)'
                  : 'No asignar usuarios por ahora (guardar solo la encuesta)'
              }
            />
          </RadioGroup>

          {assignmentMode === 'SELECTED' && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <TextField
                  size="small"
                  placeholder="Buscar por nombre o correo..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  sx={{ minWidth: 260, flex: 1 }}
                />
                <TextField
                  select
                  size="small"
                  label="Rol"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="ALL">Todos los roles</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="ASESOR">ASESOR</MenuItem>
                  <MenuItem value="INVITADO">INVITADO</MenuItem>
                </TextField>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAllFiltered}
                >
                  Seleccionar / Deseleccionar visibles
                </Button>
                <Chip
                  color="primary"
                  label={`${selectedUserIds.length} seleccionado(s)`}
                />
              </Box>

              {loadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <TableContainer
                  sx={{
                    maxHeight: 340,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>Nombre</TableCell>
                        <TableCell>Correo</TableCell>
                        <TableCell>Rol</TableCell>
                        {isEditing && <TableCell>Estado actual</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((u) => {
                        const isAlreadyAssigned = alreadyAssignedSet.has(u.id);
                        const isChecked = selectedUserIds.includes(u.id);
                        return (
                          <TableRow
                            key={u.id}
                            hover
                            onClick={() => handleToggleUser(u.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggleUser(u.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={u.role}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            {isEditing && (
                              <TableCell>
                                {isAlreadyAssigned && isChecked && (
                                  <Chip
                                    label="Asignada"
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                )}
                                {isAlreadyAssigned && !isChecked && (
                                  <Chip
                                    label="Se quitará asignación"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                                {!isAlreadyAssigned && isChecked && (
                                  <Chip
                                    label="Por asignar"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                                {!isAlreadyAssigned && !isChecked && (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    Sin asignar
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: isEditing ? 'space-between' : 'flex-end',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {isEditing && (
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={saving || deleting}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Eliminar encuesta
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Button variant="outlined" onClick={onCancel} disabled={saving || deleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving || deleting}
            startIcon={saving ? <CircularProgress size={18} /> : null}
          >
            {saving
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear encuesta'}
          </Button>
        </Box>
      </Box>

      {/* Modal de confirmación para eliminar encuesta */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Eliminar encuesta
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas eliminar la encuesta{' '}
            <strong>{surveyToEdit?.name}</strong>?
          </Typography>
          <Alert severity="warning">
            Al eliminar esta encuesta se <strong>desasignará a todos los usuarios</strong> que la
            tenían asignada (ya no les aparecerá en sus notificaciones) y se{' '}
            <strong>borrarán permanentemente todos los resultados y respuestas</strong> registrados.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" />
              )
            }
          >
            {deleting ? 'Eliminando...' : 'Sí, eliminar encuesta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
