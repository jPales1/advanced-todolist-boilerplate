import React from 'react';
import Typography from '@mui/material/Typography';
import RecentActivities from './sections/recentActivities';
import HomeStyles from './homeStyle';

const Home: React.FC = () => {
  const { Container, Header } = HomeStyles;

	return (
		<Container>
      <Header>
				<Typography variant="h3">Bem-vindo ao Sistema de Tarefas</Typography>
				<Typography variant="body1" textAlign={'justify'}>
					Organize suas tarefas de forma eficiente e mantenha-se produtivo! 
					Aqui você pode acompanhar suas atividades recentes e gerenciar todas as suas tarefas.
				</Typography>
			</Header>
			<RecentActivities />
		</Container>
	);
};

export default Home;
