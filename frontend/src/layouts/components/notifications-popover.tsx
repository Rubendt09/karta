import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { surveyService } from 'src/services/surveyService';
import { SurveyStatus, type SurveyAssignment } from 'src/types/survey';

// ----------------------------------------------------------------------

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
};

export type NotificationsPopoverProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

export function NotificationsPopover({ data = [], sx, ...other }: NotificationsPopoverProps) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(data);
  const [surveys, setSurveys] = useState<SurveyAssignment[]>([]);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;
  const pendingSurveys = surveys.filter((s) => s.status === SurveyStatus.PENDIENTE).length;

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const loadSurveys = useCallback(async () => {
    try {
      const dataSurveys = await surveyService.getMySurveys();
      setSurveys(dataSurveys);
    } catch (err) {
      console.error('Error loading surveys:', err);
    }
  }, []);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
      loadSurveys();
    },
    [loadSurveys]
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isUnRead: false,
    }));

    setNotifications(updatedNotifications);
  }, [notifications]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleSurveyClick = useCallback(
    (assignmentId: string) => {
      handleClosePopover();
      navigate(`/surveys/${assignmentId}`);
    },
    [handleClosePopover, navigate]
  );

  const totalBadge = totalUnRead + pendingSurveys;

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalBadge} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificaciones</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tienes {totalUnRead} notificaciones no leídas
              {pendingSurveys > 0 && ` · ${pendingSurveys} encuestas pendientes`}
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Nuevas
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Anteriores
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>

          {/* Surveys section */}
          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: 'overline', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                Encuestas
                {pendingSurveys > 0 && (
                  <Chip label={pendingSurveys} size="small" color="error" sx={{ height: 18, fontSize: 11 }} />
                )}
              </ListSubheader>
            }
          >
            {surveys.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled', py: 1.5, px: 2.5 }}>
                No hay encuestas disponibles
              </Typography>
            ) : (
              surveys.map((survey) => (
                <SurveyItem key={survey.id} survey={survey} onClick={() => handleSurveyClick(survey.id)} />
              ))
            )}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit">
            Ver todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({ notification }: { notification: NotificationItemProps }) {
  const { avatarUrl, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatarUrl}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function SurveyItem({
  survey,
  onClick,
}: {
  survey: SurveyAssignment;
  onClick: () => void;
}) {
  const isPending = survey.status === SurveyStatus.PENDIENTE;

  const getStatusColor = (status: SurveyStatus): 'warning' | 'success' | 'default' => {
    switch (status) {
      case SurveyStatus.PENDIENTE:
        return 'warning';
      case SurveyStatus.COMPLETADA:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SurveyStatus): string => {
    switch (status) {
      case SurveyStatus.PENDIENTE:
        return 'Pendiente';
      case SurveyStatus.COMPLETADA:
        return 'Completada';
      case SurveyStatus.EXPIRADA:
        return 'Expirada';
      default:
        return status;
    }
  };

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(isPending && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>
          <Iconify icon="solar:file-bold-duotone" width={24} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {survey.surveyName}
            </Typography>
            <Chip
              label={getStatusLabel(survey.status)}
              size="small"
              color={getStatusColor(survey.status)}
              variant={isPending ? 'filled' : 'outlined'}
              sx={{ height: 20, fontSize: 11, flexShrink: 0 }}
            />
          </Box>
        }
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(survey.assignedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order-placed') {
    return {
      avatarUrl: (
        <img
          alt={notification.title}
          src="/assets/icons/notification/ic-notification-package.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'order-shipped') {
    return {
      avatarUrl: (
        <img
          alt={notification.title}
          src="/assets/icons/notification/ic-notification-shipping.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-mail.svg" />
      ),
      title,
    };
  }
  if (notification.type === 'chat-message') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-chat.svg" />
      ),
      title,
    };
  }
  return {
    avatarUrl: notification.avatarUrl ? (
      <img alt={notification.title} src={notification.avatarUrl} />
    ) : null,
    title,
  };
}
