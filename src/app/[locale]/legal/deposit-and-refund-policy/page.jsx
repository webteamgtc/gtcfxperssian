import { legalRoute } from '../components/legalRoute';

export const revalidate = 3600;

const route = legalRoute('deposit-and-refund-policy');
export const generateMetadata = route.generateMetadata;
export default route.Page;
