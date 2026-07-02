import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Fade,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { documentService } from 'src/services/documentService';
import type { DocumentResponse } from 'src/types/document';

// ----------------------------------------------------------------------

interface ProjectChatProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  tags?: DocumentResponse[];
  createdAt: Date;
}

// ----------------------------------------------------------------------

export function ProjectChat({ projectId, projectName, open, onClose }: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<DocumentResponse[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load project documents when chat opens
  useEffect(() => {
    if (!open) return;

    const loadDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const data = await documentService.getDocumentsByProject(projectId);
        setDocuments(data);
      } catch (err) {
        console.error('Error loading documents for chat:', err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    loadDocuments();
  }, [open, projectId]);

  // Add initial bot message when chat opens
  useEffect(() => {
    if (!open) return;

    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 'welcome',
          sender: 'bot',
          text: `Hola, estás en el proyecto **${projectName}**. ¿En qué puedo ayudarte?`,
          createdAt: new Date(),
        },
      ];
    });
  }, [open, projectName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && selectedTags.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      tags: selectedTags.length > 0 ? [...selectedTags] : undefined,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedTags([]);

    // Placeholder bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Entiendo. Estoy procesando tu solicitud sobre este proyecto.',
          createdAt: new Date(),
        },
      ]);
    }, 600);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleOpenDocumentMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDocumentMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectDocument = (document: DocumentResponse) => {
    if (!selectedTags.find((tag) => tag.id === document.id)) {
      setSelectedTags((prev) => [...prev, document]);
    }
    handleCloseDocumentMenu();
  };

  const handleRemoveTag = (documentId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== documentId));
  };

  const availableDocuments = documents.filter(
    (doc) => !selectedTags.find((tag) => tag.id === doc.id)
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: '380px', md: '33%' },
        maxWidth: 480,
        minWidth: { xs: 'auto', sm: 320 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: (theme) =>
          theme.transitions.create('transform', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Paper
        square
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.dark', width: 36, height: 36 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 36 36">
              <g transform="translate(2, 1.25) scale(1)">
                <path fill="#F8312F" d="M5 3.5a1.5 1.5 0 0 1-1 1.415V12l2.16 5.487L4 23c-1.1 0-2-.9-2-1.998v-7.004a2 2 0 0 1 1-1.728V4.915A1.5 1.5 0 1 1 5 3.5m25.05.05c0 .681-.44 1.26-1.05 1.468V12.2c.597.347 1 .994 1 1.73v7.01c0 1.1-.9 2-2 2l-2.94-5.68L28 11.93V5.018a1.55 1.55 0 1 1 2.05-1.468" />
                <path fill="#FFB02E" d="M11 4.5A1.5 1.5 0 0 1 12.5 3h7a1.5 1.5 0 0 1 .43 2.938c-.277.082-.57.104-.847.186l-3.053.904l-3.12-.908c-.272-.08-.56-.1-.832-.18A1.5 1.5 0 0 1 11 4.5" />
                <path fill="#CDC4D6" d="M22.05 30H9.95C6.66 30 4 27.34 4 24.05V12.03C4 8.7 6.7 6 10.03 6h11.95C25.3 6 28 8.7 28 12.03v12.03c0 3.28-2.66 5.94-5.95 5.94" />
                <path fill="#212121" d="M9.247 18.5h13.506c2.33 0 4.247-1.919 4.247-4.25A4.257 4.257 0 0 0 22.753 10H9.247A4.257 4.257 0 0 0 5 14.25a4.257 4.257 0 0 0 4.247 4.25m4.225 7.5h5.056C19.34 26 20 25.326 20 24.5s-.66-1.5-1.472-1.5h-5.056C12.66 23 12 23.674 12 24.5s.66 1.5 1.472 1.5" />
                <path fill="#00A6ED" d="M10.25 12C9.56 12 9 12.56 9 13.25v2.5a1.25 1.25 0 1 0 2.5 0v-2.5c0-.69-.56-1.25-1.25-1.25m11.5 0c-.69 0-1.25.56-1.25 1.25v2.5a1.25 1.25 0 1 0 2.5 0v-2.5c0-.69-.56-1.25-1.25-1.25" />
              </g>
            </svg>
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Asistente IA
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {projectName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <Iconify icon="mingcute:close-line" width={22} height={22} />
        </IconButton>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.50' : 'background.default'),
        }}
      >
        {messages.map((message) => (
          <Fade in key={message.id}>
            <Box
              sx={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                  color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                  border: message.sender === 'user' ? 'none' : 1,
                  borderColor: 'divider',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
                {message.tags && message.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {message.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'inherit',
                          color: 'inherit',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  mx: 0.5,
                  color: 'text.secondary',
                  textAlign: message.sender === 'user' ? 'right' : 'left',
                }}
              >
                {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <Box
          sx={{
            px: 2,
            pt: 1,
            pb: 0.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {selectedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              onDelete={() => handleRemoveTag(tag.id)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleOpenDocumentMenu}
            disabled={documentsLoading || availableDocuments.length === 0}
            sx={{ color: 'text.secondary' }}
          >
            {documentsLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Iconify icon="solar:file-bold-duotone" width={22} height={22} />
            )}
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <IconButton
            onClick={handleSend}
            disabled={!inputText.trim() && selectedTags.length === 0}
            sx={{ minWidth: 0, borderRadius: 1.5 }}
          >
            <Iconify icon="solar:plain-2-bold" width={30} height={30} />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseDocumentMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ zIndex: 10001 }}
          slotProps={{
            paper: { sx: { maxHeight: 300, width: 280 } },
          }}
        >
          {availableDocuments.length === 0 ? (
            <MenuItem disabled>No hay documentos disponibles</MenuItem>
          ) : (
            availableDocuments.map((doc) => (
              <MenuItem key={doc.id} onClick={() => handleSelectDocument(doc)} dense>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:file-bold-duotone" width={18} height={18} />
                  <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                    {doc.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>
    </Box>
  );
}
