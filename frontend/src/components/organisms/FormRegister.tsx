import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, Paper } from '@mantine/core';
import classes from '../../styles/RegisterForm.module.css';
import FormSectionTitle from '../atoms/FormSectionTitle';
import GlobalErrorOverlay from '../atoms/GlobalErrorOverlay';
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
  });

  const handleChange = (field: string, value: string | number | string[] | null) => setForm({ ...form, [field]: value });

  const requiredFields = [
    ['nombre', 'email', 'telefono', 'password', 'genero', 'fechaNacimiento'],
    ['altura', 'peso', 'objetivoPeso'],
    ['nivelActividad', 'frecuenciaEjercicio'],
    ['tipoEjercicio', 'objetivo'],
    ['comidasDia'],
    []
  ];

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const validateStep = async () => {
    const fields = requiredFields[active] ?? [];
    const newErrors: { [key: string]: string } = {};
    
    fields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});

    try {
      const stepPayload = buildStepPayload(active);
      const res = await apiRequest(apiConfig.endpoints.users.validateStep(active), {
        method: 'POST',
        body: JSON.stringify(stepPayload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors: { [key: string]: string } = {};
          
          data.errors.forEach((error: { type: string; value: string; msg: string; path: string; location: string }) => {
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
              'activity.nivelActividad': 'nivelActividad',
              'activity.frecuenciaEjercicio': 'frecuenciaEjercicio',
              'activity.tipoEjercicio': 'tipoEjercicio',
              'activity.objetivo': 'objetivo',
              'activity.preferenciasEjercicios': 'otrosEjercicios'
            };
            
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
      }
    } catch (error) {
      console.error('Error validando paso:', error);
    }
    
    return true;
  };

  const buildStepPayload = (step: number) => {
    const basePayload = {
      fullName: String(form.nombre),
      email: String(form.email).trim().toLowerCase(),
      password: String(form.password),
      phoneNumber: String(form.telefono),
      gender: String(form.genero),
      birthDate: form.fechaNacimiento ? new Date(form.fechaNacimiento as unknown as string | number | Date).toISOString() : undefined,
    };

    switch (step) {
      case 0:
        return basePayload;
      case 1:
        return {
          ...basePayload,
          health: {
            altura: Number(form.altura),
            pesoActual: Number(form.peso),
            objetivoPeso: Number(form.objetivoPeso),
            condicionesMedicas: csvToArray(String(form.condiciones)),
            restriccionesDieteticas: [],
            alergiasIntolerancias: [],
            preferenciasAlimentarias: []
          }
        };
      case 2:
        return {
          ...basePayload,
          health: {
            altura: Number(form.altura),
            pesoActual: Number(form.peso),
            objetivoPeso: Number(form.objetivoPeso),
            condicionesMedicas: csvToArray(String(form.condiciones)),
            restriccionesDieteticas: [],
            alergiasIntolerancias: [],
            preferenciasAlimentarias: []
          },
          activity: {
            nivelActividad: String(form.nivelActividad),
            frecuenciaEjercicio: Number(form.frecuenciaEjercicio),
            tipoEjercicio: [],
            objetivo: '',
            preferenciasEjercicios: []
          }
        };
      case 3:
        return {
          ...basePayload,
          health: {
            altura: Number(form.altura),
            pesoActual: Number(form.peso),
            objetivoPeso: Number(form.objetivoPeso),
            condicionesMedicas: csvToArray(String(form.condiciones)),
            restriccionesDieteticas: [],
            alergiasIntolerancias: [],
            preferenciasAlimentarias: []
          },
          activity: {
            nivelActividad: String(form.nivelActividad),
            frecuenciaEjercicio: Number(form.frecuenciaEjercicio),
            tipoEjercicio: Array.isArray(form.tipoEjercicio) ? form.tipoEjercicio : [],
            objetivo: String(form.objetivo),
            preferenciasEjercicios: csvToArray(String(form.otrosEjercicios))
          }
        };
      case 4:
        return {
          ...basePayload,
          health: {
            altura: Number(form.altura),
            pesoActual: Number(form.peso),
            objetivoPeso: Number(form.objetivoPeso),
            condicionesMedicas: csvToArray(String(form.condiciones)),
            restriccionesDieteticas: csvToArray(String(form.restricciones)),
            alergiasIntolerancias: csvToArray(String(form.alergias)),
            preferenciasAlimentarias: csvToArray(String(form.preferencias))
          },
          activity: {
            nivelActividad: String(form.nivelActividad),
            frecuenciaEjercicio: Number(form.frecuenciaEjercicio),
            tipoEjercicio: Array.isArray(form.tipoEjercicio) ? form.tipoEjercicio : [],
            objetivo: String(form.objetivo),
            preferenciasEjercicios: csvToArray(String(form.otrosEjercicios))
          }
        };
      default:
        return basePayload;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) setActive((current) => current + 1);
  };

  const csvToArray = (v?: string) => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const birthDate = form.fechaNacimiento
      ? new Date(form.fechaNacimiento as unknown as string | number | Date).toISOString()
      : undefined;

    const payload = {
      fullName: String(form.nombre),
      email: String(form.email).trim().toLowerCase(),
      password: String(form.password),
      phoneNumber: String(form.telefono),
      gender: String(form.genero),
      birthDate,
      health: {
        altura: Number(form.altura),
        pesoActual: Number(form.peso),
        objetivoPeso: Number(form.objetivoPeso),
        condicionesMedicas: csvToArray(String(form.condiciones)),
        restriccionesDieteticas: csvToArray(String(form.restricciones)),
        alergiasIntolerancias: csvToArray(String(form.alergias)),
        preferenciasAlimentarias: csvToArray(String(form.preferencias))
      },
      activity: {
        nivelActividad: String(form.nivelActividad),
        frecuenciaEjercicio: Number(form.frecuenciaEjercicio),
        tipoEjercicio: Array.isArray(form.tipoEjercicio) ? form.tipoEjercicio : [],
        objetivo: String(form.objetivo),
        preferenciasEjercicios: csvToArray(String(form.otrosEjercicios))
      }
    };

    try {
      const res = await apiRequest(apiConfig.endpoints.users.register, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors: { [key: string]: string } = {};
          
          data.errors.forEach((error: { type: string; value: string; msg: string; path: string; location: string }) => {
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
              'activity.nivelActividad': 'nivelActividad',
              'activity.frecuenciaEjercicio': 'frecuenciaEjercicio',
              'activity.tipoEjercicio': 'tipoEjercicio',
              'activity.objetivo': 'objetivo',
              'activity.preferenciasEjercicios': 'otrosEjercicios'
            };
            
            const frontendField = fieldMapping[error.path];
            if (frontendField) {
              validationErrors[frontendField] = error.msg;
            }
          });
          
          setErrors(validationErrors);
          return;
        }
        
        setSubmitError(data?.message || 'Error al registrar');
        return;
      }
      
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/login');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al registrar';
      setSubmitError(msg);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <GlobalErrorOverlay message={submitError} withCloseButton onClose={() => setSubmitError(null)} />
      <Paper className={classes.form}>
        <div style={{ position: 'absolute', top: 32, left: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <FormSectionTitle className={classes.title}>Crea tu cuenta</FormSectionTitle>
        </div>
        <div style={{ height: 60 }} />

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
              }}
              onChange={handleChange}
              errors={errors}
            />
          </Stepper.Step>
        </Stepper>

        <StepNavigation
          isFirstStep={active === 0}
          isLastStep={active >= 4}
          isSubmitting={isSubmitting}
          onBack={() => setActive((current) => Math.max(current - 1, 0))}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </Paper>
    </div>
  );
};

export default RegisterForm;