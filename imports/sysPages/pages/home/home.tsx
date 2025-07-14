import React, { useContext } from 'react';
import Typography from '@mui/material/Typography';
import RecentActivities from './sections/recentActivities';
import HomeStyles from './homeStyle';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';

const Home: React.FC = () => {
  const { Container, Header } = HomeStyles;
	const { user } = useContext<IAuthContext>(AuthContext);
	return (
		<Container>
      <Header>
				<Typography variant="h2">Olá, {user?.username}</Typography>
				<Typography variant="body1" textAlign={'justify'}>
					Seus projetos muito mais organizados. Veja as tarefas adicionadas por seu time, por você e para você!
				</Typography>
			</Header>
			<RecentActivities />
		</Container>
	);
};

export default Home;
