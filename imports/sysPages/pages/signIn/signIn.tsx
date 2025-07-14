import React, { useContext, useEffect } from 'react';
import SignInStyles from './signInStyles';
import { useNavigate } from 'react-router-dom';
import SysTextField from '../../../ui/components/sysFormFields/sysTextField/sysTextField';
import SysForm from '../../../ui/components/sysForm/sysForm';
import SysFormButton from '../../../ui/components/sysFormFields/sysFormButton/sysFormButton';
import { signInSchema } from './signinsch';
import Typography from '@mui/material/Typography';
import SysIcon from '../../../ui/components/sysIcon/sysIcon';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';
import Box from '@mui/material/Box';

const SignInPage: React.FC = () => {
	const { showNotification } = useContext(AppLayoutContext);
	const { user, signIn } = useContext<IAuthContext>(AuthContext);
	const navigate = useNavigate();
	const { Container, Content, FormContainer, FormWrapper, RegisterRecovery } = SignInStyles;

	const handleSubmit = ({ email, password }: { email: string; password: string }) => {
		signIn(email, password, (err) => {
			if (!err) navigate('/');
			showNotification({
				type: 'error',
				title: 'Erro ao tentar logar',
				message: 'Email ou senha inválidos'
			});
		});
	};

	const handleForgotPassword = () => navigate('/password-recovery');
	const handleRegister = () => navigate('/signup');

	useEffect(() => {
		if (user) navigate('/');
	}, [user]);

	return (
		<Container>
			<Content>
				<Typography variant="h1" color={'black'}>
					ToDo List
				</Typography>

				<Typography variant="body1" color={'black'} textAlign={'center'}>
					Boas-vindas a sua lista de tarefas.
					<br />
					Insira seu e-mail e senha para efetuar o login:
				</Typography>

				<FormContainer>
					<SysForm schema={signInSchema} onSubmit={handleSubmit} debugAlerts={false}>
						<FormWrapper>
							<SysTextField name="email" label="Email" fullWidth placeholder="Digite seu email" />
							<SysTextField label="Senha" fullWidth name="password" placeholder="Digite sua senha" type="password" />

							<SysFormButton variant="contained" color="primary" endIcon={<SysIcon name={'arrowForward'} />}>
								Entrar
							</SysFormButton>

							<RegisterRecovery>
								<Typography variant="body1" color={'black'} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
									Esqueceu sua senha?
									<Typography variant="link" onClick={handleForgotPassword} sx={{ cursor: 'pointer' }}>
										Clique aqui
									</Typography>
								</Typography>

								<Typography variant="body1" color={'black'} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
									Novo por aqui?
									<Typography variant="link" onClick={handleRegister} sx={{ cursor: 'pointer' }}>
										Cadastre-se
									</Typography>
								</Typography>
							</RegisterRecovery>
						</FormWrapper>
					</SysForm>
				</FormContainer>
			</Content>
		</Container>
	);
};

export default SignInPage;
