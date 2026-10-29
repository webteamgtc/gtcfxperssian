import { legalRoute } from '../components/legalRoute';

export const revalidate = 3600;

const route = legalRoute('kyc-compliance-policy');
export const generateMetadata = route.generateMetadata;
export default route.Page;
