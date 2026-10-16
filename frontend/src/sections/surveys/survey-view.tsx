import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

import { surveyService } from 'src/services/surveyService';
import {
  SurveyStatus,
  type SurveyAssignment,
  type SurveyForm,
  type SurveyQuestion,
  type SurveySection,
  type SurveyAnswers,
} from 'src/types/survey';

// ----------------------------------------------------------------------

const DEFAULT_SCALE: Record<string, string> = {
  '1': 'Totalmente en desacuerdo',
  '2': 'En desacuerdo',
  '3': 'Ni de acuerdo ni en desacuerdo',
  '4': 'De acuerdo',
  '5': 'Totalmente de acuerdo',
};

export function SurveyView() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<SurveyAssignment | null>(null);
  const [form, setForm] = useState<SurveyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finalComment, setFinalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const loadAssignment = useCallback(async () => {
    if (!assignmentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.getSurveyAssignment(assignmentId);
      setAssignment(data);

      let parsedForm: SurveyForm | null = null;
      try {
        parsedForm = JSON.parse(data.formJson) as SurveyForm;
      } catch {
        setError('El formulario de la encuesta no es válido.');
      }
      setForm(parsedForm);

      // Pre-fill answers if already responded
      if (data.responseJson) {
        try {
          const parsed = JSON.parse(data.responseJson) as SurveyAnswers;
          setAnswers(parsed.answers ?? {});
          setFinalComment(parsed.finalComment ?? '');
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setError('Error al cargar la encuesta. Por favor, intenta nuevamente.');
      console.error('Error loading survey:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const handleRatingChange = (questionId: string, value: number | null) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value ?? 0 }));
  };

  const validate = (): string[] => {
    if (!form) return [];
    const errors: string[] = [];
    form.questions.forEach((q) => {
      if (q.required && !answers[q.id]) {
        errors.push(`La pregunta "${q.text}" es obligatoria.`);
      }
    });
    if (form.finalComment?.enabled && form.finalComment.required && !finalComment.trim()) {
      errors.push('El comentario final es obligatorio.');
    }
    return errors;
  };

  const handleSubmit = async () => {
    if (!assignment || !form) return;

    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    try {
      setSubmitting(true);
      const payload: SurveyAnswers = {
        answers,
        finalComment: form.finalComment?.enabled ? finalComment.trim() : undefined,
      };
      await surveyService.submitSurvey(assignment.id, {
        responseJson: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('Error al enviar la encuesta. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !form) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>
    );
  }

  if (!form || !assignment) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="warning">No se pudo cargar la encuesta.</Alert>
      </Box>
    );
  }

  const isCompleted = assignment.status === SurveyStatus.COMPLETADA;
  const scale = form.scale ?? DEFAULT_SCALE;

  if (submitted || (isCompleted && !loading)) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Iconify
              icon="solar:check-circle-bold"
              width={72}
              sx={{ mb: 2, color: 'success.main' }}
            />
            <Typography variant="h5" sx={{ mb: 1 }}>
              ¡Gracias por tus respuestas!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tu encuesta ha sido registrada exitosamente.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Group questions by section if sections exist, otherwise flat list
  const hasSections = form.sections && form.sections.length > 0;
  let questionIndex = 0;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {form.title || assignment.surveyName}
        </Typography>
        {form.description && (
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {form.description}
          </Typography>
        )}
      </Box>

      {/* Scale legend */}
      <Card sx={{ mb: 3, bgcolor: 'action.hover' }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="overline" color="text.secondary">
            Escala de calificación
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {Object.entries(scale).map(([key, label]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {key}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {validationErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Questions grouped by section */}
      {hasSections ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {form.sections!.map((section) => (
            <Box key={section.id}>
              <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.questions.map((question) => {
                  const idx = questionIndex++;
                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={idx}
                      value={answers[question.id] ?? 0}
                      scale={scale}
                      onChange={(val) => handleRatingChange(question.id, val)}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {form.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id] ?? 0}
              scale={scale}
              onChange={(val) => handleRatingChange(question.id, val)}
            />
          ))}
        </Box>
      )}

      {/* Final comment */}
      {form.finalComment?.enabled && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              {form.finalComment.label || 'Comentarios finales'}
              {form.finalComment.required && (
                <Typography component="span" color="error.main">
                  {' '}*
                </Typography>
              )}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Escribe tus comentarios aquí..."
              value={finalComment}
              onChange={(e) => setFinalComment(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={submitting}
          onClick={handleSubmit}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Enviando...' : 'Enviar respuestas'}
        </Button>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  value: number;
  scale: Record<string, string>;
  onChange: (value: number | null) => void;
}

function QuestionCard({ question, index, value, scale, onChange }: QuestionCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {index + 1}. {question.text}
          {question.required && (
            <Typography component="span" color="error.main">
              {' '}*
            </Typography>
          )}
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={value || null}
          onChange={(_, newValue) => onChange(newValue)}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButton-root': {
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5,
              py: 0.75,
              flexDirection: 'column',
              minWidth: 110,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        >
          {Object.entries(scale).map(([key, label]) => {
            const numValue = Number(key);
            return (
              <ToggleButton key={key} value={numValue} aria-label={label}>
                <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 700 }}>
                  {key}
                </Typography>
                <Typography variant="caption" sx={{ textAlign: 'center', mt: 0.5, lineHeight: 1.2 }}>
                  {label}
                </Typography>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        {value > 0 && (
          <Typography variant="body2" color="primary.main" sx={{ mt: 1.5, fontWeight: 600 }}>
            Seleccionado: {value} - {scale[String(value)] ?? ''}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
