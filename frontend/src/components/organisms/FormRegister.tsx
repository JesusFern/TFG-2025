import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, Paper, ScrollArea, LoadingOverlay, Box } from '@mantine/core';
import classes from '../../styles/RegisterForm.module.css';
import FormSectionTitle from '../atoms/FormSectionTitle';
import GlobalErrorOverlay from '../atoms/GlobalErrorOverlay';
import GlobalSuccessOverlay from '../atoms/GlobalSuccessOverlay';
import StepNavigation from '../molecules/StepNavigation';
import PersonalInfoStep from '../molecules/PersonalInfoStep';
import PhysicalDataStep from '../molecules/PhysicalDataStep';
import ActivityStep from '../molecules/ActivityStep';
import ExerciseStep from '../molecules/ExerciseStep';
import NutritionStep from '../molecules/NutritionStep';
import { RegisterFormErrors, RegisterFormState } from '../../types';
import { apiRequest, apiConfig } from '../../services/api';

const actividadOptions = [
  { value: 'Sedentario', label: 'Sedentario' },
  { value: 'Ocasional', label: 'Ocasional' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Frecuente', label: 'Frecuente' },
  { value: 'Diario', label: 'Diario' },
];

const ejercicioOptions = [
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Musculación', label: 'Musculación' },
  { value: 'Deportes de equipo', label: 'Deportes de equipo' },
  { value: 'Yoga/Pilates', label: 'Yoga/Pilates' },
  { value: 'Natación', label: 'Natación' },
  { value: 'Ciclismo', label: 'Ciclismo' },
  { value: 'Running', label: 'Running' },
  { value: 'Otros', label: 'Otros' },
];

const objetivoOptions = [
  { value: 'Pérdida de peso', label: 'Pérdida de peso' },
  { value: 'Ganancia muscular', label: 'Ganancia muscular' },
  { value: 'Resistencia', label: 'Resistencia' },
  { value: 'Flexibilidad', label: 'Flexibilidad' },
  { value: 'Salud general', label: 'Salud general' },
  { value: 'Rehabilitación', label: 'Rehabilitación' },
];

const generoOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
];

const RegisterForm = () => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterFormState>({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: null,
    password: '',
    genero: '',
    altura: '',
    peso: '',
    objetivoPeso: '',
    condiciones: '',
    nivelActividad: '',
    frecuenciaEjercicio: '',
    tipoEjercicio: [],
    otrosEjercicios: '',
    disponibilidad: '',
    objetivo: '',
    preferencias: '',
    comidasDia: '',
    restricciones: '',
    alergias: '',
    horariosComidas: [],
  });

  const handleChange = (field: string, value: string | number | string[] | Array<{ comida: string; hora: string }> | null) => setForm({ ...form, [field]: value });

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  // Mapeo de campos del backend a campos del frontend
  const fieldMapping: { [key: string]: string } = {
    'fullName': 'nombre',
    'email': 'email',
    'password': 'password',
    'phoneNumber': 'telefono',
    'gender': 'genero',
    'birthDate': 'fechaNacimiento',
    'health.altura': 'altura',
    'health.pesoActual': 'peso',
    'health.objetivoPeso': 'objetivoPeso',
    'health.condicionesMedicas': 'condiciones',
    'health.restriccionesDieteticas': 'restricciones',
    'health.alergiasIntolerancias': 'alergias',
    'health.preferenciasAlimentarias': 'preferencias',
    'health.comidasDia': 'comidasDia',
    'health.horariosComidas': 'horariosComidas',
    'activity.nivelActividad': 'nivelActividad',
    'activity.frecuenciaEjercicio': 'frecuenciaEjercicio',
    'activity.tipoEjercicio': 'tipoEjercicio',
    'activity.objetivo': 'objetivo',
    'activity.otrosEjercicios': 'otrosEjercicios',
    'activity.disponibilidad': 'disponibilidad'
  };

  // Función auxiliar para procesar errores de validación
  const processValidationErrors = (data: { errors?: Array<{ type: string; value: string; msg: string; path: string; location: string }> }) => {
    if (data.errors && Array.isArray(data.errors)) {
      const validationErrors: { [key: string]: string } = {};
      
      data.errors.forEach((error: { type: string; value: string; msg: string; path: string; location: string }) => {
        const frontendField = fieldMapping[error.path];
        if (frontendField) {
          validationErrors[frontendField] = error.msg;
        } else {
          validationErrors[error.path] = error.msg;
        }
      });
      
      setErrors(validationErrors);
      return false;
    }
    return true;
  };

  const validateStep = async () => {
    setErrors({});

    try {
      const stepPayload = buildStepPayload(active);
      const res = await apiRequest(apiConfig.endpoints.users.validateStep(active), {
        method: 'POST',
        body: JSON.stringify(stepPayload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        return processValidationErrors(data);
      }
    } catch (error) {
      console.error('Error validando paso:', error);
    }
    
    return true;
  };

  const validateFinalStep = async () => {
    setErrors({});

    try {
      // Validar específicamente el paso final (step 4)
      const finalStepPayload = buildStepPayload(4);
      const res = await apiRequest(apiConfig.endpoints.users.validateStep(4), {
        method: 'POST',
        body: JSON.stringify(finalStepPayload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        return processValidationErrors(data);
      }
    } catch (error) {
      console.error('Error validando paso final:', error);
    }
    
    return true;
  };

  const csvToArray = (v?: string) => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);

  // Función auxiliar para construir el payload base
  const buildBasePayload = () => ({
    fullName: String(form.nombre),
    email: String(form.email).trim().toLowerCase(),
    password: String(form.password),
    phoneNumber: String(form.telefono),
    gender: String(form.genero),
    birthDate: form.fechaNacimiento ? new Date(form.fechaNacimiento as unknown as string | number | Date).toISOString() : undefined,
  });

  // Función auxiliar para construir el payload de salud
  const buildHealthPayload = (includeAllFields = false) => {
    const healthPayload: Record<string, unknown> = {
      altura: Number(form.altura),
      pesoActual: Number(form.peso),
      objetivoPeso: Number(form.objetivoPeso),
      condicionesMedicas: csvToArray(String(form.condiciones)),
    };

    if (includeAllFields) {
      healthPayload.restriccionesDieteticas = csvToArray(String(form.restricciones));
      healthPayload.alergiasIntolerancias = csvToArray(String(form.alergias));
      healthPayload.preferenciasAlimentarias = csvToArray(String(form.preferencias));
      healthPayload.comidasDia = form.comidasDia ? Number(form.comidasDia) : undefined;
      healthPayload.horariosComidas = form.horariosComidas || [];
    } else {
      healthPayload.restriccionesDieteticas = [];
      healthPayload.alergiasIntolerancias = [];
      healthPayload.preferenciasAlimentarias = [];
      healthPayload.comidasDia = form.comidasDia ? Number(form.comidasDia) : undefined;
      healthPayload.horariosComidas = form.horariosComidas || [];
    }

    return healthPayload;
  };

  // Función auxiliar para construir el payload de actividad
  const buildActivityPayload = (includeExerciseFields = false) => {
    const activityPayload: Record<string, unknown> = {
      nivelActividad: String(form.nivelActividad),
      frecuenciaEjercicio: Number(form.frecuenciaEjercicio),
    };

    if (includeExerciseFields) {
      activityPayload.tipoEjercicio = Array.isArray(form.tipoEjercicio) && form.tipoEjercicio.length > 0 ? form.tipoEjercicio : null;
      activityPayload.objetivo = String(form.objetivo);
      activityPayload.otrosEjercicios = String(form.otrosEjercicios);
      activityPayload.disponibilidad = String(form.disponibilidad);
    }

    return activityPayload;
  };

  const buildStepPayload = (step: number) => {
    const basePayload = buildBasePayload();

    switch (step) {
      case 0:
        return basePayload;
      case 1:
        return {
          ...basePayload,
          health: buildHealthPayload(false)
        };
      case 2:
        return {
          ...basePayload,
          health: buildHealthPayload(false),
          activity: buildActivityPayload(false)
        };
      case 3:
        return {
          ...basePayload,
          health: buildHealthPayload(false),
          activity: buildActivityPayload(true)
        };
      case 4:
        return {
          ...basePayload,
          health: buildHealthPayload(true),
          activity: buildActivityPayload(true)
        };
      default:
        return basePayload;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) setActive((current) => current + 1);
  };

  const handleSubmit = async () => {
    // Validar específicamente el paso final antes de enviar
    const finalStepValid = await validateFinalStep();
    if (!finalStepValid) return;

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Usar las funciones auxiliares para construir el payload final
      const payload = {
        ...buildBasePayload(),
        health: buildHealthPayload(true),
        activity: buildActivityPayload(true)
      };

      const res = await apiRequest(apiConfig.endpoints.users.register, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors: { [key: string]: string } = {};
          
          data.errors.forEach((error: { type: string; value: string; msg: string; path: string; location: string }) => {
            const frontendField = fieldMapping[error.path];
            if (frontendField) {
              validationErrors[frontendField] = error.msg;
            }
          });
          
          setErrors(validationErrors);
          return;
        }
        
        if (data?.message) {
          setSubmitError(data.message);
          return;
        }
        
        setSubmitError('Error al registrar');
        return;
      }
      
      if (data?.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      setSubmitSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
      
      // Mantener el loader visible durante el mensaje de éxito y la redirección
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/login');
      }, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al registrar';
      setSubmitError(msg);
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <GlobalErrorOverlay message={submitError} withCloseButton onClose={() => setSubmitError(null)} />
      <GlobalSuccessOverlay message={submitSuccess} withCloseButton onClose={() => setSubmitSuccess(null)} />
      <Box pos="relative">
        <LoadingOverlay 
          visible={isSubmitting} 
          zIndex={1000} 
          overlayProps={{ radius: "sm", blur: 2 }} 
        />
        <Paper className={classes.form}>
          <div style={{ position: 'absolute', top: 32, left: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
            <FormSectionTitle className={classes.title}>Crea tu cuenta</FormSectionTitle>
          </div>
          <div style={{ height: 60 }} />

          <ScrollArea h={400} type="auto" offsetScrollbars>
            <Stepper active={active}>
              <Stepper.Step label="Personales">
                <PersonalInfoStep
                  values={{
                    nombre: String(form.nombre),
                    email: String(form.email),
                    telefono: String(form.telefono),
                    fechaNacimiento: form.fechaNacimiento ? new Date(form.fechaNacimiento as Date) : null,
                    password: String(form.password),
                    genero: String(form.genero),
                  }}
                  errors={errors}
                  onChange={handleChange}
                  generoOptions={generoOptions}
                />
              </Stepper.Step>

              <Stepper.Step label="Datos físicos">
                <PhysicalDataStep
                  values={{
                    altura: form.altura,
                    peso: form.peso,
                    objetivoPeso: form.objetivoPeso,
                    condiciones: String(form.condiciones),
                  }}
                  errors={errors}
                  onChange={handleChange}
                />
              </Stepper.Step>

              <Stepper.Step label="Actividad">
                <ActivityStep
                  values={{
                    nivelActividad: String(form.nivelActividad),
                    frecuenciaEjercicio: form.frecuenciaEjercicio,
                  }}
                  errors={errors}
                  onChange={handleChange}
                  actividadOptions={actividadOptions}
                />
              </Stepper.Step>

              <Stepper.Step label="Ejercicio">
                <ExerciseStep
                  values={{
                    tipoEjercicio: Array.isArray(form.tipoEjercicio) ? form.tipoEjercicio : [],
                    otrosEjercicios: String(form.otrosEjercicios),
                    disponibilidad: String(form.disponibilidad),
                    objetivo: String(form.objetivo),
                  }}
                  errors={errors}
                  onChange={handleChange}
                  ejercicioOptions={ejercicioOptions}
                  objetivoOptions={objetivoOptions}
                />
              </Stepper.Step>

              <Stepper.Step label="Nutrición">
                <NutritionStep
                  values={{
                    preferencias: String(form.preferencias),
                    comidasDia: form.comidasDia,
                    restricciones: String(form.restricciones),
                    alergias: String(form.alergias),
                    horariosComidas: form.horariosComidas || [],
                  }}
                  onChange={handleChange}
                  errors={errors}
                />
              </Stepper.Step>
            </Stepper>
          </ScrollArea>

          <StepNavigation
            isFirstStep={active === 0}
            isLastStep={active >= 4}
            isSubmitting={isSubmitting}
            onBack={() => setActive((current) => Math.max(current - 1, 0))}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </Paper>
      </Box>
    </div>
  );
};

export default RegisterForm;