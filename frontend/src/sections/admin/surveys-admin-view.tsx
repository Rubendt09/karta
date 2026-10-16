import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Tabs,
  Tab,
  Table,
  Alert,
  Button,
  Dialog,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { surveyService } from 'src/services/surveyService';
import {
  SurveyStatus,
  type Survey,
  type SurveyForm,
  type SurveyAnswers,
  type SurveyQuestion,
  type AdminSurveyAssignment,
} from 'src/types/survey';

import { SurveyEditorView } from './survey-editor-view';

// ----------------------------------------------------------------------

const DEFAULT_SCALE: Record<string, string> = {
  '1': 'Totalmente en desacuerdo',
  '2': 'En desacuerdo',
  '3': 'Ni de acuerdo ni en desacuerdo',
  '4': 'De acuerdo',
  '5': 'Totalmente de acuerdo',
};

interface ParsedSubmission {
  assignment: AdminSurveyAssignment;
  parsedAnswers: SurveyAnswers | null;
}

export function SurveysAdminView() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AdminSurveyAssignment[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // View mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [surveyToEdit, setSurveyToEdit] = useState<Survey | null>(null);

  const [tabIndex, setTabIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [detailModalAssignment, setDetailModalAssignment] = useState<ParsedSubmission | null>(null);

  const loadSurveys = useCallback(async () => {
    try {
      setLoadingSurveys(true);
      setError(null);
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
      if (data.length > 0 && !selectedSurveyId) {
        setSelectedSurveyId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError('Error al cargar las encuestas.');
    } finally {
      setLoadingSurveys(false);
    }
  }, [selectedSurveyId]);

  const loadSurveyResults = useCallback(async (surveyId: string) => {
    try {
      setLoadingResults(true);
      setError(null);
      const data = await surveyService.getSurveyResults(surveyId);
      setAssignments(data);
    } catch (err) {
      console.error('Error loading survey results:', err);
      setError('Error al cargar los resultados de la encuesta.');
    } finally {
      setLoadingResults(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  useEffect(() => {
    if (selectedSurveyId) {
      loadSurveyResults(selectedSurveyId);
    }
  }, [selectedSurveyId, loadSurveyResults]);

  const selectedSurvey = useMemo(
    () => surveys.find((s) => s.id === selectedSurveyId) || null,
    [surveys, selectedSurveyId]
  );

  const parsedForm = useMemo<SurveyForm | null>(() => {
    if (!selectedSurvey?.formJson) return null;
    try {
      return JSON.parse(selectedSurvey.formJson) as SurveyForm;
    } catch {
      return null;
    }
  }, [selectedSurvey]);

  const scale = parsedForm?.scale ?? DEFAULT_SCALE;

  const allQuestions = useMemo<SurveyQuestion[]>(() => {
    if (!parsedForm) return [];
    if (parsedForm.questions && parsedForm.questions.length > 0) {
      return parsedForm.questions;
    }
    if (parsedForm.sections && parsedForm.sections.length > 0) {
      return parsedForm.sections.flatMap((sec) =>
        sec.questions.map((q) => ({ ...q, section: sec.title }))
      );
    }
    return [];
  }, [parsedForm]);

  const submissions = useMemo<ParsedSubmission[]>(
    () =>
      assignments.map((assignment) => {
        let parsedAnswers: SurveyAnswers | null = null;
        if (assignment.responseJson) {
          try {
            parsedAnswers = JSON.parse(assignment.responseJson) as SurveyAnswers;
          } catch {
            parsedAnswers = null;
          }
        }
        return { assignment, parsedAnswers };
      }),
    [assignments]
  );

  const completedSubmissions = useMemo(
    () =>
      submissions.filter(
        (s) => s.assignment.status === SurveyStatus.COMPLETADA && s.parsedAnswers !== null
      ),
    [submissions]
  );

  // Calculate statistics per question and overall
  const stats = useMemo(() => {
    const totalAssigned = assignments.length;
    const completedCount = assignments.filter((a) => a.status === SurveyStatus.COMPLETADA).length;
    const pendingCount = assignments.filter((a) => a.status === SurveyStatus.PENDIENTE).length;
    const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    const questionStats = allQuestions.map((q) => {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;
      let totalResponses = 0;

      completedSubmissions.forEach((sub) => {
        const val = sub.parsedAnswers?.answers?.[q.id];
        if (typeof val === 'number' && val >= 1 && val <= 5) {
          counts[val] = (counts[val] || 0) + 1;
          sum += val;
          totalResponses += 1;
        }
      });

      const average = totalResponses > 0 ? sum / totalResponses : 0;
      return {
        question: q,
        counts,
        totalResponses,
        average,
      };
    });

    // Section averages
    const sectionMap = new Map<string, { sum: number; count: number }>();
    questionStats.forEach((qs) => {
      const secName = qs.question.section || 'General';
      if (qs.totalResponses > 0) {
        const current = sectionMap.get(secName) || { sum: 0, count: 0 };
        current.sum += qs.average;
        current.count += 1;
        sectionMap.set(secName, current);
      }
    });

    const sectionAverages = Array.from(sectionMap.entries()).map(([title, data]) => ({
      title,
      average: data.count > 0 ? data.sum / data.count : 0,
    }));

    const validQuestionAverages = questionStats.filter((q) => q.totalResponses > 0);
    const overallAverage =
      validQuestionAverages.length > 0
        ? validQuestionAverages.reduce((acc, curr) => acc + curr.average, 0) /
          validQuestionAverages.length
        : 0;

    return {
      totalAssigned,
      completedCount,
      pendingCount,
      completionRate,
      overallAverage,
      questionStats,
      sectionAverages,
    };
  }, [assignments, allQuestions, completedSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === 'ALL') return submissions;
    return submissions.filter((s) => s.assignment.status === statusFilter);
  }, [submissions, statusFilter]);

  const commentsList = useMemo(
    () =>
      completedSubmissions.filter(
        (s) => s.parsedAnswers?.finalComment && s.parsedAnswers.finalComment.trim().length > 0
      ),
    [completedSubmissions]
  );

  const assignedUserIdsSet = useMemo(
    () => new Set(assignments.map((a) => a.userId)),
    [assignments]
  );

  const handleOpenCreate = () => {
    setSurveyToEdit(null);
    setViewMode('create');
  };

  const handleOpenEdit = (survey: Survey) => {
    setSelectedSurveyId(survey.id);
    setSurveyToEdit(survey);
    setViewMode('edit');
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' | 'primary' => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    if (score > 0) return 'error';
    return 'primary';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserAverage = (sub: ParsedSubmission): number => {
    if (!sub.parsedAnswers?.answers) return 0;
    const values = Object.values(sub.parsedAnswers.answers).filter(
      (v): v is number => typeof v === 'number' && v >= 1 && v <= 5
    );
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Render Create or Edit view
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <SurveyEditorView
        surveyToEdit={viewMode === 'edit' ? surveyToEdit : null}
        existingAssignedUserIds={
          viewMode === 'edit' ? Array.from(assignedUserIdsSet) : []
        }
        onCancel={() => setViewMode('list')}
        onSaved={async (savedSurveyId, message) => {
          setViewMode('list');
          setSuccessMsg(message);
          setSelectedSurveyId(savedSurveyId);
          await loadSurveys();
          await loadSurveyResults(savedSurveyId);
        }}
        onDeleted={async (deletedSurveyId, message) => {
          setViewMode('list');
          setSurveyToEdit(null);
          setSuccessMsg(message);
          const remaining = surveys.filter((s) => s.id !== deletedSurveyId);
          const nextId = remaining.length > 0 ? remaining[0].id : null;
          setSelectedSurveyId(nextId);
          if (!nextId) {
            setAssignments([]);
          }
          await loadSurveys();
        }}
      />
    );
  }

  if (loadingSurveys) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <Typography variant="h4">Encuestas y Resultados</Typography>
          <Typography variant="body2" color="text.secondary">
            Crea y edita cuestionarios, asígnalos a usuarios y analiza los resultados obtenidos
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleOpenCreate}
          startIcon={<Iconify icon="solar:add-bold" />}
        >
          Crear nueva encuesta
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Lista de Encuestas */}
      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
        Encuestas registradas ({surveys.length})
      </Typography>

      {surveys.length === 0 ? (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Iconify icon="solar:file-bold-duotone" width={56} sx={{ opacity: 0.4, mb: 1.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No hay encuestas registradas
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-bold" />}
              onClick={handleOpenCreate}
            >
              Crear primera encuesta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {surveys.map((survey) => {
            const isSelected = survey.id === selectedSurveyId;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={survey.id}>
                <Card
                  onClick={() => setSelectedSurveyId(survey.id)}
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>
                        {survey.name}
                      </Typography>
                      <Chip
                        label={survey.active ? 'Activa' : 'Inactiva'}
                        size="small"
                        color={survey.active ? 'success' : 'default'}
                      />
                    </Box>

                    {survey.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {survey.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Asignadas: ${survey.totalAssigned ?? 0}`}
                      />
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={`Completadas: ${survey.completedCount ?? 0}`}
                      />
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={`Pendientes: ${survey.pendingCount ?? 0}`}
                      />
                      <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                        Creada: {formatDate(survey.createdAt)}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={() => handleOpenEdit(survey)}
                      >
                        Gestionar encuesta
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Resultados de la encuesta seleccionada */}
      {selectedSurvey && (
        <>
          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h5">{selectedSurvey.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Resultados consolidados y respuestas recibidas
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={() => handleOpenEdit(selectedSurvey)}
              >
                Gestionar encuesta
              </Button>
            </Box>
          </Box>

          {loadingResults ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* KPI Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Usuarios Asignados
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.totalAssigned}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Encuestas Completadas
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {stats.completedCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({stats.completionRate}%)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Encuestas Pendientes
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats.pendingCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Promedio General (1 - 5)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {stats.overallAverage > 0 ? stats.overallAverage.toFixed(2) : '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 5.00
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Promedios por Sección / Dimensión */}
              {stats.sectionAverages.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {stats.sectionAverages.map((sec) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={sec.title}>
                      <Card sx={{ bgcolor: 'background.neutral' }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle2">{sec.title}</Typography>
                            <Chip
                              size="small"
                              color={getScoreColor(sec.average)}
                              label={`${sec.average.toFixed(2)} / 5`}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(sec.average / 5) * 100}
                            color={getScoreColor(sec.average)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Tabs de Detalle */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                  <Tab label={`Resultados por Pregunta (${allQuestions.length})`} />
                  <Tab label={`Respuestas de Usuarios (${assignments.length})`} />
                  <Tab label={`Comentarios Finales (${commentsList.length})`} />
                </Tabs>
              </Box>

              {/* TAB 0: Resultados por Pregunta */}
              {tabIndex === 0 && (
                <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 80 }}>Código</TableCell>
                          <TableCell>Pregunta</TableCell>
                          <TableCell sx={{ width: 130 }}>Dimensión</TableCell>
                          <TableCell align="center" sx={{ width: 230 }}>
                            Distribución (1 a 5)
                          </TableCell>
                          <TableCell align="center" sx={{ width: 160 }}>
                            Promedio
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.questionStats.map(({ question, counts, totalResponses, average }) => (
                          <TableRow key={question.id} hover>
                            <TableCell>
                              <Chip label={question.id} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{question.text}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {question.section || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: 0.75,
                                  flexWrap: 'wrap',
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <Chip
                                    key={score}
                                    size="small"
                                    label={`${score}: ${counts[score] || 0}`}
                                    variant={counts[score] > 0 ? 'filled' : 'outlined'}
                                    color={
                                      counts[score] > 0
                                        ? score >= 4
                                          ? 'success'
                                          : score === 3
                                            ? 'warning'
                                            : 'error'
                                        : 'default'
                                    }
                                    sx={{ fontSize: 11, height: 22 }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {totalResponses > 0 ? (
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={700}>
                                    {average.toFixed(2)} / 5
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(average / 5) * 100}
                                    color={getScoreColor(average)}
                                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                  />
                                  <Typography variant="caption" color="text.disabled">
                                    {totalResponses} resp.
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  Sin respuestas
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}

              {/* TAB 1: Respuestas de Usuarios */}
              {tabIndex === 1 && (
                <Card>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Listado de usuarios asignados ({filteredSubmissions.length})
                    </Typography>
                    <TextField
                      select
                      size="small"
                      label="Filtrar por estado"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="ALL">Todos ({submissions.length})</MenuItem>
                      <MenuItem value={SurveyStatus.COMPLETADA}>
                        Completadas ({stats.completedCount})
                      </MenuItem>
                      <MenuItem value={SurveyStatus.PENDIENTE}>
                        Pendientes ({stats.pendingCount})
                      </MenuItem>
                    </TextField>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Rol</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Fecha Asignación</TableCell>
                          <TableCell>Fecha Respuesta</TableCell>
                          <TableCell align="center">Promedio</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSubmissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                No hay registros para el filtro seleccionado
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubmissions.map((sub) => {
                            const { assignment } = sub;
                            const isCompleted = assignment.status === SurveyStatus.COMPLETADA;
                            const userAvg = getUserAverage(sub);
                            return (
                              <TableRow key={assignment.id} hover>
                                <TableCell>
                                  <Typography variant="subtitle2">{assignment.userName}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {assignment.userEmail}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={assignment.userRole} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={isCompleted ? 'Completada' : 'Pendiente'}
                                    size="small"
                                    color={isCompleted ? 'success' : 'warning'}
                                  />
                                </TableCell>
                                <TableCell>{formatDate(assignment.assignedAt)}</TableCell>
                                <TableCell>{formatDate(assignment.completedAt)}</TableCell>
                                <TableCell align="center">
                                  {isCompleted && userAvg > 0 ? (
                                    <Chip
                                      size="small"
                                      color={getScoreColor(userAvg)}
                                      label={`${userAvg.toFixed(2)} / 5`}
                                    />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {isCompleted ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Iconify icon="solar:eye-bold" />}
                                      onClick={() => setDetailModalAssignment(sub)}
                                    >
                                      Ver respuestas
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">
                                      Sin responder
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}

              {/* TAB 2: Comentarios Finales */}
              {tabIndex === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {commentsList.length === 0 ? (
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">
                          Aún no hay comentarios finales registrados en esta encuesta.
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    commentsList.map(({ assignment, parsedAnswers }) => (
                      <Card key={assignment.id}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2">{assignment.userName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {assignment.userEmail} · {assignment.userRole}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.disabled">
                              {formatDate(assignment.completedAt)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.neutral',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {parsedAnswers?.finalComment}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Modal de detalle individual de respuestas */}
      <Dialog
        open={Boolean(detailModalAssignment)}
        onClose={() => setDetailModalAssignment(null)}
        maxWidth="md"
        fullWidth
      >
        {detailModalAssignment && (
          <>
            <DialogTitle>
              Respuestas de {detailModalAssignment.assignment.userName}
              <Typography variant="body2" color="text.secondary">
                {detailModalAssignment.assignment.userEmail} · Respondido el{' '}
                {formatDate(detailModalAssignment.assignment.completedAt)}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 70 }}>Código</TableCell>
                      <TableCell>Pregunta</TableCell>
                      <TableCell align="center" sx={{ width: 220 }}>
                        Calificación
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allQuestions.map((q) => {
                      const val = detailModalAssignment.parsedAnswers?.answers?.[q.id];
                      return (
                        <TableRow key={q.id}>
                          <TableCell>
                            <Chip label={q.id} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{q.text}</TableCell>
                          <TableCell align="center">
                            {val ? (
                              <Chip
                                size="small"
                                color={getScoreColor(val)}
                                label={`${val} - ${scale[String(val)] || ''}`}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {detailModalAssignment.parsedAnswers?.finalComment && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Comentario final:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    <Typography variant="body2">
                      {detailModalAssignment.parsedAnswers.finalComment}
                    </Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailModalAssignment(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
