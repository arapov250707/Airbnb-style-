import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../context/Appcontext';
import { propertyService } from '../services/api';
import PropertyForm from '../components/property/PropertyForm';
import styles from './PropertyFormPage.module.css';

export function PropertyCreatePage() {
  const { user } = useAuth();
  const { add } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const property = await propertyService.create({
      ...data,
      hostId: user.id,
      hostName: user.name,
      hosted: new Date().getFullYear().toString(),
      featured: false,
    });
    add('Property listed successfully! 🏡', 'success');
    navigate(`/properties/${property.id}`);
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className="section-title">List your property</h1>
            <p className="section-subtitle">Fill in the details to start hosting</p>
          </div>
        </div>
        <div className={styles.formCard}>
          <PropertyForm onSubmit={handleSubmit} submitLabel="List Property" />
        </div>
      </div>
    </div>
  );
}

export default PropertyCreatePage;
