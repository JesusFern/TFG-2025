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
import RestrictionsStep from '../molecules/RestrictionsStep';
import { RegisterFormErrors, RegisterFormState } from '../../types';

const actividadOptions = [
  { value: 'sedentario', label: 'Sedentario' },
  { value: 'ligero', label: 'Ligero' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'intenso', label: 'Intenso' },
];

const ejercicioOptions = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'natacion', label: 'Natación' },
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'running', label: 'Running' },
  { value: 'ciclismo', label: 'Ciclismo' },
  { value: 'otros', label: 'Otros' },
];

const objetivoOptions = [
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'perdida_peso', label: 'Pérdida de peso' },
  { value: 'rendimiento', label: 'Rendimiento deportivo' },
  { value: 'salud', label: 'Mejorar salud' },
];

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
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

  // Función para actualizar el estado del formulario
  const handleChange = (field: string, value: string | number | string[] | null) => setForm({ ...form, [field]: value });

  const requiredFields = [
    // Paso 0: Personales
    ['nombre', 'email', 'telefono', 'password', 'genero', 'fechaNacimiento'],
    // Paso 1: Datos físicos
    ['altura', 'peso', 'objetivoPeso'],
    // Paso 2: Actividad
    ['nivelActividad', 'frecuenciaEjercicio'],
    // Paso 3: Ejercicio
    ['tipoEjercicio', 'objetivo'],
    // Paso 4: Nutrición
    ['comidasDia'],
    // Paso 5: Restricciones (sin obligatorios)
    []
  ];

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const validateStep = () => {
    const fields = requiredFields[active] ?? [];
    const newErrors: { [key: string]: string } = {};
    fields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActive((current) => current + 1);
  };

  const csvToArray = (v?: string) => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const mapGender = (g?: string) => g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : g;

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
      gender: mapGender(String(form.genero)),
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
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        const backendMsg = Array.isArray(data?.errors)
          ? data.errors.map((e: { msg?: string }) => e?.msg).filter(Boolean).join('\n')
          : (data?.message || 'Error al registrar');
        setSubmitError(backendMsg);
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
              }}
              onChange={handleChange}
            />
          </Stepper.Step>

          <Stepper.Step label="Restricciones">
            <RestrictionsStep
              values={{
                restricciones: String(form.restricciones),
                alergias: String(form.alergias),
              }}
              onChange={handleChange}
            />
          </Stepper.Step>
        </Stepper>

        <StepNavigation
          isFirstStep={active === 0}
          isLastStep={active >= 5}
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