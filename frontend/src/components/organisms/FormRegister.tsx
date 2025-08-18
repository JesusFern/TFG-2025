import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper, Button, Group, Paper, Title, TextInput, PasswordInput, Select, MultiSelect, NumberInput, Textarea
} from '@mantine/core';
import { Alert } from '@mantine/core';
import classes from '../../styles/RegisterForm.module.css';
import DatePickerInput from "../atoms/DatePickerInput";

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
  const [form, setForm] = useState<{ 
    [key: string]: string | number | string[] | null | Date;
    nombre: string;
    email: string;
    telefono: string;
    fechaNacimiento: null | Date;
    password: string;
    genero: string;
    altura: string;
    peso: string;
    objetivoPeso: string;
    condiciones: string;
    nivelActividad: string;
    frecuenciaEjercicio: string;
    tipoEjercicio: string[];
    otrosEjercicios: string;
    disponibilidad: string;
    objetivo: string;
    preferencias: string;
    comidasDia: string;
    restricciones: string;
    alergias: string;
  }>({
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  // Renderizado de cada paso
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <>
        {/* Título centrado arriba */}
        <div style={{
            position: 'absolute',
            top: 32,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 2
        }}>
            <Title order={2} className={classes.title}>Crea tu cuenta</Title>
        </div>

        {/* Espacio para el título */}
        <div style={{ height: 60 }} />

        {/* Error global del envío */}
        {submitError && (
          <Alert color="red" variant="light" style={{ marginBottom: 12 }}>
            {submitError}
          </Alert>
        )}

        <Stepper active={active}>
            <Stepper.Step label="Personales">
            <div style={{ display: 'flex', gap: 24, width: '100%' }}>
                {/* Columna izquierda */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TextInput
                    label="Nombre y apellidos"
                    value={form.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    required
                    size="md"
                    error={errors.nombre}
                />
                <TextInput
                    label="Correo electrónico"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    required
                    size="md"
                    error={errors.email}
                />
                <TextInput
                    label="Número de teléfono"
                    placeholder="+34123456789"
                    value={form.telefono}
                    onChange={e => handleChange('telefono', e.target.value)}
                    required
                    size="md"
                    error={errors.telefono}
                />
                </div>
                {/* Columna derecha */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DatePickerInput
                    label="Fecha de nacimiento"
                    value={form.fechaNacimiento ? new Date(form.fechaNacimiento) : null}
                    onChange={(date) => handleChange('fechaNacimiento', date ? date.toISOString() : null)}
                    error={errors.fechaNacimiento}
                    required
                    />
                <PasswordInput
                    label="Contraseña"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    required
                    size="md"
                    error={errors.password}
                />
                <Select
                    label="Género"
                    data={generoOptions}
                    value={form.genero}
                    onChange={value => handleChange('genero', value)}
                    required
                    size="md"
                    error={errors.genero}
                />
                </div>
            </div>
            </Stepper.Step>
            {/* Paso 2 */}
          <Stepper.Step label="Datos físicos">
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput
                label="Altura (cm)"
                value={form.altura}
                onChange={e => handleChange('altura', e.target.value)}
                style={{ flex: 1 }}
              />
              <TextInput
                label="Peso actual (kg)"
                value={form.peso}
                onChange={e => handleChange('peso', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <NumberInput label="Objetivo de peso (kg)" value={form.objetivoPeso} onChange={value => handleChange('objetivoPeso', value)} required mt="md" />
            <Textarea label="Condiciones médicas" value={form.condiciones} onChange={e => handleChange('condiciones', e.target.value)} mt="md" />
          </Stepper.Step>
          {/* Paso 3 */}
          <Stepper.Step label="Actividad">
            <Select label="Nivel de actividad física" data={actividadOptions} value={form.nivelActividad} onChange={value => handleChange('nivelActividad', value)} required />
            <NumberInput label="Frecuencia de ejercicio semanal" value={form.frecuenciaEjercicio} onChange={value => handleChange('frecuenciaEjercicio', value)} required mt="md" />
          </Stepper.Step>
          {/* Paso 4 */}
          <Stepper.Step label="Ejercicio">
            <MultiSelect label="Tipo de ejercicio habitual" data={ejercicioOptions} value={form.tipoEjercicio} onChange={value => handleChange('tipoEjercicio', value)} required />
            <TextInput label="Otros ejercicios" value={form.otrosEjercicios} onChange={e => handleChange('otrosEjercicios', e.target.value)} mt="md" />
            <TextInput label="Disponibilidad para entrenar" value={form.disponibilidad} onChange={e => handleChange('disponibilidad', e.target.value)} mt="md" />
            <Select label="Objetivo principal" data={objetivoOptions} value={form.objetivo} onChange={value => handleChange('objetivo', value)} required mt="md" />
          </Stepper.Step>
          {/* Paso 5 */}
          <Stepper.Step label="Nutrición">
            <Textarea label="Preferencias alimentarias" value={form.preferencias} onChange={e => handleChange('preferencias', e.target.value)} />
            <NumberInput label="Número de comidas al día" value={form.comidasDia} onChange={value => handleChange('comidasDia', value)} required mt="md" />
          </Stepper.Step>
          {/* Paso 6 */}
          <Stepper.Step label="Restricciones">
            <Textarea label="Restricciones alimentarias" value={form.restricciones} onChange={e => handleChange('restricciones', e.target.value)} />
            <Textarea label="Intolerancias o alergias alimentarias" value={form.alergias} onChange={e => handleChange('alergias', e.target.value)} mt="md" />
          </Stepper.Step>
        </Stepper>

    {/* Botones abajo */}
    <Group justify="space-between" mt="xl" style={{ width: '100%', position: 'absolute', bottom: 32, left: 0, padding: '0 32px' }}>
      <Button
        variant="default"
        onClick={() => setActive((current) => Math.max(current - 1, 0))}
        disabled={active === 0}
      >
        Atrás
      </Button>
      <Button onClick={active < 5 ? handleNext : handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : active < 5 ? 'Siguiente' : 'Crear cuenta'}
      </Button>
    </Group>
  </>
        </Paper>
      </div>
    );
  };

export default RegisterForm;