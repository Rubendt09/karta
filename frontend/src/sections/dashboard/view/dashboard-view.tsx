import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export function DashboardView() {
  return (
    <DashboardContent maxWidth="xl">

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <Typography variant="h4" sx={{ mb: { xs: 3, md: 1 } }}>
            Panel de Control
          </Typography>
          {/** leras pequenias */}
          <Typography variant="inherit" sx={{ mb: { xs: 2, md: 5 } }}>
            Bienvenido de nuevo, Administrador. Aquí está el resumen de hoy.
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 7 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
              {/** boton de fondo blanco */}
              <Button variant="contained" color="inherit" sx={{ minWidth: 'fit-content' }}>
                <Iconify icon="solar:download-minimalistic-bold" sx={{ mr: 1 }} />
                Exportar reporte
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
              {/** boton de fondo azul */}
              <Button variant="contained" color="primary" sx={{ minWidth: 'fit-content' }}>
                <Iconify icon="solar:add-bold" sx={{ mr: 1 }} />
                Nuevo proyecto
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/** Users Active Widget */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Usuarios Activos"
            percent={12}
            total={1284}
            icon={
              <Iconify width={48} icon="solar:users-group-rounded-bold-duotone" />
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Proyectos totales"
            percent={4}
            total={432}
            color="secondary"
            icon={
              <Iconify width={48} icon="solar:folder-favourite-bookmark-bold" />
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Documentos indexados "
            percent={-2}
            total={432}
            color="warning"
            icon={
              <Iconify width={48} icon="solar:file-bold-duotone" />
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Almacenamiento"
            percent={15}
            total={1400}
            color="error"
            icon={
              <Iconify width={48} icon="solar:database-bold" />
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        {/* Activity Chart */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Actividad de Usurios y Documentos"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid>

        {/* Distribution Chart */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Distribución de Archivos"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>


        {/**
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_traffic} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid>
        */}
      </Grid>
    </DashboardContent>
  );
}
