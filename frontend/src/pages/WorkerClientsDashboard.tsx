import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
	Title, 
	Text, 
	Card, 
	Stack, 
	Grid, 
	Group, 
	Badge, 
	Button, 
	Avatar, 
	Container,
	Loader,
	Alert,
	Paper,
	useMantineColorScheme,
	TextInput
} from '@mantine/core';
import { IconAlertCircle, IconUser, IconWeight, IconRuler, IconNotes, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { getClientesAsignados, ClienteAsignado } from '../services/workerService';
import { getUserData } from '../services/authService';

interface DatosSaludYNutricion {
	peso?: number;
	altura?: number;
	imc?: number;
	alergias?: string[];
	restriccionesDieteticas?: string[];
}

const WorkerClientsDashboard: React.FC = () => {
	const [clientes, setClientes] = useState<ClienteAsignado[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';
	const user = getUserData();
	const [searchParams] = useSearchParams();

	// Leer parámetro de URL para filtrar por cliente
	useEffect(() => {
		const clienteParam = searchParams.get('cliente');
		if (clienteParam) {
			setSearchQuery(clienteParam);
		}
	}, [searchParams]);

	useEffect(() => {
		if (!user?._id) return;
		
		const fetchClientes = async () => {
			try {
				setLoading(true);
				const clientes = await getClientesAsignados();
				setClientes(clientes);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Error al obtener los clientes');
			} finally {
				setLoading(false);
			}
		};

		fetchClientes();
	}, [user?._id]);


	const handleCrearDieta = (clienteId: string) => {
		navigate(`/crear-dieta/${clienteId}`);
	};

	const handleVerDietas = (clienteId: string) => {
		navigate(`/worker/dashboard-clients/${clienteId}/diets`);
	};

	const handleCrearPlan = (clienteId: string) => {
		navigate(`/training/planes/tipo?clientId=${clienteId}`);
	};

	const handleVerPlanes = (clienteId: string) => {
		navigate(`/worker/dashboard-clients/${clienteId}/training`);
	};

	const handleBackToDashboard = () => {
		navigate('/dashboard');
	};
	
	const getBadgeColor = (genero?: string) => {
		if (!genero) return 'gray';
		switch (genero.toLowerCase()) {
			case 'masculino': return 'blue';
			case 'femenino': return 'pink';
			default: return 'grape';
		}
	};

  
	// Agrupar clientes por ID para manejar múltiples asignaciones
	const clientesAgrupados = clientes.reduce((acc, cliente) => {
		const clienteId = cliente.clienteId;
		if (!acc[clienteId]) {
			acc[clienteId] = {
				...cliente,
				tiposAsignacion: [cliente.tipoAsignacion]
			};
		} else {
			// Si el cliente ya existe, agregar el nuevo tipo de asignación
			if (!acc[clienteId].tiposAsignacion.includes(cliente.tipoAsignacion)) {
				acc[clienteId].tiposAsignacion.push(cliente.tipoAsignacion);
			}
		}
		return acc;
	}, {} as Record<string, ClienteAsignado & { tiposAsignacion: string[] }>);

	const clientesUnicos = Object.values(clientesAgrupados);

	const filteredClients = clientesUnicos.filter(cliente => 
		(cliente.cliente?.fullName && cliente.cliente.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
		(cliente.cliente?.email && cliente.cliente.email.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	if (loading) {
		return (
			<Container p="xl" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<Stack align="center" gap="md">
					<Loader size="lg" color="nutroos-green" />
					<Text size="lg" fw={500}>Cargando clientes asignados...</Text>
				</Stack>
			</Container>
		);
	}

	if (error) {
		return (
			<Container p="xl">
				<Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
					{error}
				</Alert>
			</Container>
		);
	}

	return (
		<Container size="xl" p="xl">
			<Paper 
				p="md" 
				shadow="xs" 
				radius="md" 
				mb="xl" 
				withBorder
				style={{ 
					backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
					borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
				}}
			>
				<Group justify="space-between">
					<div>
						<Title order={2} mb="xs">Panel de Gestión de clientes</Title>
						<Text c="dimmed">Bienvenido/a, {user?.fullName}</Text>
					</div>
					<Group gap="md">
					<Badge size="lg" color="nutroos-green">
						{clientesUnicos.length} {clientesUnicos.length === 1 ? 'cliente asignado' : 'clientes asignados'}
					</Badge>
						<Button
							leftSection={<IconArrowLeft size={16} />}
							variant="light"
							onClick={handleBackToDashboard}
						>
							Volver al Dashboard
						</Button>
					</Group>
				</Group>
			</Paper>
      
			{clientesUnicos.length > 0 && (
				<TextInput
					placeholder="Buscar cliente por nombre o email..."
					leftSection={<IconSearch size={16} />}
					mb="md"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			)}

			{clientesUnicos.length === 0 ? (
				<Card 
					p="xl" 
					radius="md" 
					withBorder
					style={{ 
						backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
						borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
					}}
				>
					<Stack align="center" gap="md" p="xl">
						<IconUser size={48} color="var(--mantine-color-gray-5)" />
						<Text size="lg" fw={500} ta="center">No tienes clientes asignados</Text>
						<Text c="dimmed" ta="center">
							Cuando tengas clientes asignados, podrás verlos aquí y gestionar sus dietas.
						</Text>
					</Stack>
				</Card>
			) : filteredClients.length === 0 ? (
				<Card 
					p="xl" 
					radius="md" 
					withBorder
					style={{ 
						backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
						borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
					}}
				>
					<Stack align="center" gap="md" p="xl">
						<IconSearch size={48} color="var(--mantine-color-gray-5)" />
						<Text size="lg" fw={500} ta="center">No se encontraron clientes</Text>
						<Text c="dimmed" ta="center">
							No hay clientes que coincidan con tu búsqueda. Intenta con otros términos.
						</Text>
						<Button 
							variant="light" 
							color="nutroos-green" 
							onClick={() => setSearchQuery('')}
						>
							Mostrar todos los clientes
						</Button>
					</Stack>
				</Card>
			) : (
				<Grid>
					{filteredClients.map((cliente) => (
						<Grid.Col key={cliente.clienteId} span={{ base: 12, md: 6, lg: 4 }}>
							<Card 
								p="md" 
								radius="md" 
								withBorder
								style={{ 
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
									borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
								}}
							>
								<Group justify="space-between" mb="xs">
									<Group
										style={{ cursor: 'pointer' }}
										onClick={() => window.location.href = `/profile/${cliente.clienteId}`}
									>
										<Avatar 
											color="nutroos-green" 
											radius="xl"
										>
											{cliente.cliente?.fullName?.charAt(0).toUpperCase() || '?'}
										</Avatar>
										<div>
											<Text fw={700} style={{ color: 'var(--mantine-color-cyan-6)' }}>{cliente.cliente?.fullName || 'Sin nombre'}</Text>
											<Text size="sm" c="dimmed">{cliente.cliente?.email || 'Sin email'}</Text>
										</div>
									</Group>
									<Group gap="xs">
										{cliente.cliente?.gender && (
											<Badge color={getBadgeColor(cliente.cliente.gender)} size="sm">
												{cliente.cliente.gender}
											</Badge>
										)}
										{cliente.tiposAsignacion?.map((tipo, index) => (
											<Badge 
												key={index}
												color={tipo === 'Nutricionista' ? 'nutroos-green' : 'blue'} 
												size="sm"
											>
												{tipo === 'Nutricionista' ? 'Cliente de nutrición' : 'Cliente de entrenamiento'}
											</Badge>
										))}
									</Group>
								</Group>
                
								<Stack gap="xs" mb="md" style={{ flex: 1 }}>
									<Group grow gap="xs">
										{(cliente.cliente?.datosSaludYNutricion as DatosSaludYNutricion)?.peso && (
											<Badge 
												leftSection={<IconWeight size={14} />}
												color="blue" 
												variant="outline"
											>
												{(cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).peso} kg
											</Badge>
										)}
                    
										{(cliente.cliente?.datosSaludYNutricion as DatosSaludYNutricion)?.altura && (
											<Badge 
												leftSection={<IconRuler size={14} />}
												color="cyan" 
												variant="outline"
											>
												{(cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).altura} cm
											</Badge>
										)}
                    
										{(cliente.cliente?.datosSaludYNutricion as DatosSaludYNutricion)?.imc && (
											<Badge 
												leftSection={<IconNotes size={14} />}
												color="teal" 
												variant="outline"
											>
												IMC: {(cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).imc!.toFixed(1)}
											</Badge>
										)}
									</Group>
                  
									{(cliente.cliente?.datosSaludYNutricion as DatosSaludYNutricion)?.alergias && (cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).alergias!.length > 0 && (
										<div>
											<Text size="sm" fw={500} mt="xs">Alergias:</Text>
											<Group gap="xs">
												{(cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).alergias!.map((alergia: string, index: number) => (
													<Badge key={index} color="red" size="sm">{alergia}</Badge>
												))}
											</Group>
										</div>
									)}
                  
									{(cliente.cliente?.datosSaludYNutricion as DatosSaludYNutricion)?.restriccionesDieteticas && (cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).restriccionesDieteticas!.length > 0 && (
										<div>
											<Text size="sm" fw={500} mt="xs">Restricciones dietéticas:</Text>
											<Group gap="xs">
												{(cliente.cliente.datosSaludYNutricion as DatosSaludYNutricion).restriccionesDieteticas!.map((restriccion: string, index: number) => (
													<Badge key={index} color="orange" size="sm">{restriccion}</Badge>
												))}
											</Group>
										</div>
									)}
								</Stack>
                
												<Stack gap="xs" mt="auto">
													{/* Botones de Dieta */}
													{cliente.tiposAsignacion?.includes('Nutricionista') && (
														<Group grow>
															<Button 
																color="nutroos-green"
																onClick={() => handleCrearDieta(cliente.clienteId)}
																size="sm"
															>
																Crear dieta
															</Button>
															<Button 
																variant="outline"
																color="nutroos-green"
																onClick={() => handleVerDietas(cliente.clienteId)}
																size="sm"
															>
																Ver dietas
															</Button>
														</Group>
													)}
													
													{/* Botones de Entrenamiento */}
													{cliente.tiposAsignacion?.includes('Entrenador personal') && (
														<Group grow>
															<Button 
																color="blue"
																onClick={() => handleCrearPlan(cliente.clienteId)}
																size="sm"
															>
																Crear plan
															</Button>
															<Button 
																variant="outline"
																color="blue"
																onClick={() => handleVerPlanes(cliente.clienteId)}
																size="sm"
															>
																Ver planes
															</Button>
														</Group>
													)}
													
													{/* Botón para ver perfil del cliente */}
													<Button
														color="cyan"
														variant="light"
														fullWidth
														size="sm"
														leftSection={<IconUser size={16} />}
														onClick={() => window.location.href = `/profile/${cliente.clienteId}`}
													>
														Ver Perfil del Cliente
													</Button>
												</Stack>
							</Card>
						</Grid.Col>
					))}
				</Grid>
			)}
		</Container>
	);
};

export default WorkerClientsDashboard;
