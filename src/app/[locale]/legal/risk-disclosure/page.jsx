import { legalRoute } from '../components/legalRoute';

export const revalidate = 3600;

const route = legalRoute('risk-disclosure');
export const generateMetadata = route.generateMetadata;
export default route.Page;
