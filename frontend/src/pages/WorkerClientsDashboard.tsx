import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { IconAlertCircle, IconUser, IconWeight, IconRuler, IconNotes, IconSearch } from '@tabler/icons-react';
import { getClientesAsignados, ClienteAsignado } from '../services/workerService';
import { getUserData } from '../services/authService';

const WorkerClientsDashboard: React.FC = () => {
	const [clientes, setClientes] = useState<ClienteAsignado[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';
	const user = getUserData();

	useEffect(() => {
		const fetchClientes = async () => {
			try {
				setLoading(true);
				const data = await getClientesAsignados();
				setClientes(data.clientes);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Error al obtener los clientes');
			} finally {
				setLoading(false);
			}
		};

		fetchClientes();
	}, []);


	const handleCrearDieta = (clienteId: string) => {
		navigate(`/crear-dieta/${clienteId}`);
	};

	const handleVerDietas = (clienteId: string) => {
		navigate(`/worker/dashboard-clients/${clienteId}/diets`);
	};

	const handleCrearPlan = (clienteId: string) => {
		navigate(`/training/planes/crear?clientId=${clienteId}`);
	};

	const handleVerPlanes = (clienteId: string) => {
		navigate(`/worker/dashboard-clients/${clienteId}/training`);
	};
	
	const getBadgeColor = (genero?: string) => {
		if (!genero) return 'gray';
		switch (genero.toLowerCase()) {
			case 'masculino': return 'blue';
			case 'femenino': return 'pink';
			default: return 'grape';
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'No disponible';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
	};
  
	const filteredClients = clientes.filter(cliente => 
		cliente.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
		cliente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(cliente.phoneNumber && cliente.phoneNumber.includes(searchQuery))
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
						<Title order={2} mb="xs">Panel de Nutricionista</Title>
						<Text c="dimmed">Bienvenido/a, {user?.fullName}</Text>
					</div>
					<Badge size="lg" color="nutroos-green">
						{clientes.length} {clientes.length === 1 ? 'cliente asignado' : 'clientes asignados'}
					</Badge>
				</Group>
			</Paper>
      
			{clientes.length > 0 && (
				<TextInput
					placeholder="Buscar cliente por nombre, email o teléfono..."
					leftSection={<IconSearch size={16} />}
					mb="md"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			)}

			{clientes.length === 0 ? (
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
						<Grid.Col key={cliente._id} span={{ base: 12, md: 6, lg: 4 }}>
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
									<Group>
										<Avatar 
											color="nutroos-green" 
											radius="xl"
										>
											{cliente.fullName.charAt(0).toUpperCase()}
										</Avatar>
										<div>
											<Text fw={700}>{cliente.fullName}</Text>
											<Text size="sm" c="dimmed">{cliente.email}</Text>
										</div>
									</Group>
									<Group gap="xs">
										{cliente.gender && (
											<Badge color={getBadgeColor(cliente.gender)} size="sm">
												{cliente.gender}
											</Badge>
										)}
										{cliente.tipoAsignacion && (
											<Badge 
												color={cliente.tipoAsignacion === 'Nutricionista' ? 'nutroos-green' : 'blue'} 
												size="sm"
											>
												{cliente.tipoAsignacion}
											</Badge>
										)}
									</Group>
								</Group>
                
								<Stack gap="xs" mb="md" style={{ flex: 1 }}>
									{cliente.phoneNumber && (
										<Text size="sm">
											<b>Teléfono:</b> {cliente.phoneNumber}
										</Text>
									)}
                  
									{cliente.birthDate && (
										<Text size="sm">
											<b>Fecha de nacimiento:</b> {formatDate(cliente.birthDate)}
										</Text>
									)}
                  
									<Group grow gap="xs" mt="xs">
										{cliente.datosSaludYNutricion?.peso && (
											<Badge 
												leftSection={<IconWeight size={14} />}
												color="blue" 
												variant="outline"
											>
												{cliente.datosSaludYNutricion.peso} kg
											</Badge>
										)}
                    
										{cliente.datosSaludYNutricion?.altura && (
											<Badge 
												leftSection={<IconRuler size={14} />}
												color="cyan" 
												variant="outline"
											>
												{cliente.datosSaludYNutricion.altura} cm
											</Badge>
										)}
                    
										{cliente.datosSaludYNutricion?.imc && (
											<Badge 
												leftSection={<IconNotes size={14} />}
												color="teal" 
												variant="outline"
											>
												IMC: {cliente.datosSaludYNutricion.imc.toFixed(1)}
											</Badge>
										)}
									</Group>
                  
									{cliente.datosSaludYNutricion?.alergias && cliente.datosSaludYNutricion.alergias.length > 0 && (
										<div>
											<Text size="sm" fw={500} mt="xs">Alergias:</Text>
											<Group gap="xs">
												{cliente.datosSaludYNutricion.alergias.map((alergia, index) => (
													<Badge key={index} color="red" size="sm">{alergia}</Badge>
												))}
											</Group>
										</div>
									)}
                  
									{cliente.datosSaludYNutricion?.restriccionesDieteticas && cliente.datosSaludYNutricion.restriccionesDieteticas.length > 0 && (
										<div>
											<Text size="sm" fw={500} mt="xs">Restricciones dietéticas:</Text>
											<Group gap="xs">
												{cliente.datosSaludYNutricion.restriccionesDieteticas.map((restriccion, index) => (
													<Badge key={index} color="orange" size="sm">{restriccion}</Badge>
												))}
											</Group>
										</div>
									)}
								</Stack>
                
												<Group grow mt="auto">
													{cliente.tipoAsignacion === 'Nutricionista' ? (
														<>
															<Button 
																color="nutroos-green"
																onClick={() => handleCrearDieta(cliente._id)}
															>
																Crear dieta
															</Button>
															<Button 
																variant="outline"
																color="nutroos-green"
																onClick={() => handleVerDietas(cliente._id)}
															>
																Ver dietas
															</Button>
														</>
													) : cliente.tipoAsignacion === 'Entrenador personal' ? (
														<>
															<Button 
																color="blue"
																onClick={() => handleCrearPlan(cliente._id)}
															>
																Crear plan
															</Button>
															<Button 
																variant="outline"
																color="blue"
																onClick={() => handleVerPlanes(cliente._id)}
															>
																Ver planes
															</Button>
														</>
													) : (
														// Fallback: mostrar todos los botones si no hay tipo de asignación definido
														<>
															<Button 
																color="nutroos-green"
																onClick={() => handleCrearDieta(cliente._id)}
															>
																Crear dieta
															</Button>
															<Button 
																variant="outline"
																color="nutroos-green"
																onClick={() => handleVerDietas(cliente._id)}
															>
																Ver dietas
															</Button>
															<Button 
																color="blue"
																onClick={() => handleCrearPlan(cliente._id)}
															>
																Crear plan
															</Button>
															<Button 
																variant="outline"
																color="blue"
																onClick={() => handleVerPlanes(cliente._id)}
															>
																Ver planes
															</Button>
														</>
													)}
												</Group>
							</Card>
						</Grid.Col>
					))}
				</Grid>
			)}
		</Container>
	);
};

export default WorkerClientsDashboard;
