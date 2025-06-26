import { ElementType } from 'react';
import { styled } from '@mui/material/styles';
import  Box,{ BoxProps } from '@mui/material/Box';
import { sysSizing } from '/imports/ui/materialui/styles';
import {SysSectionPaddingXY} from "/imports/ui/layoutComponents/sysLayoutComponents";

interface IToDosListStyles {
	Container: ElementType<BoxProps>;
	LoadingContainer: ElementType<BoxProps>;
	SearchContainer: ElementType<BoxProps>;
	DrawerContainer: ElementType<BoxProps>;
	DrawerHeader: ElementType<BoxProps>;
	DrawerContent: ElementType<BoxProps>;
	DrawerFooter: ElementType<BoxProps>;
	DrawerInfoSection: ElementType<BoxProps>;
}

const ToDosListStyles: IToDosListStyles = {
	Container: styled(SysSectionPaddingXY)(() => ({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		width: '100%',
		height: '100vh',
		overflow: 'auto',
		gap: sysSizing.spacingFixedMd,
    marginBottom: sysSizing.contentFabDistance
	})),
	LoadingContainer: styled(Box)(({ theme }) => ({
		width: '100%',
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		gap: theme.spacing(2)
	})),
	SearchContainer: styled(Box)(({ theme }) => ({
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
		maxWidth: '616px',
		gap: sysSizing.spacingFixedMd,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column'
		}
	})),
	DrawerContainer: styled(Box)(() => ({
		height: '100%',
		display: 'flex',
		flexDirection: 'column'
	})),
	DrawerHeader: styled(Box)(({ theme }) => ({
		padding: theme.spacing(3),
		borderBottom: '1px solid',
		borderColor: theme.palette.divider
	})),
	DrawerContent: styled(Box)(({ theme }) => ({
		flex: 1,
		padding: theme.spacing(3),
		overflow: 'auto'
	})),
	DrawerFooter: styled(Box)(({ theme }) => ({
		padding: theme.spacing(3),
		borderTop: '1px solid',
		borderColor: theme.palette.divider
	})),
	DrawerInfoSection: styled(Box)(({ theme }) => ({
		marginBottom: theme.spacing(3)
	}))
};

export default ToDosListStyles;
