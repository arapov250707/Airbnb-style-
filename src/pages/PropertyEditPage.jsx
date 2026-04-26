import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/Appcontext';
import { propertyService } from '../services/api';
import PropertyForm from '../components/property/PropertyForm';
import styles from './PropertyFormPage.module.css';

export default function PropertyEditPage() {
  const { id } = useParams();
  const { add } = useNotification();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService.getById(id).then(setProperty).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await propertyService.update(id, data);
    add('Property updated!', 'success');
    navigate(`/properties/${id}`);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className="section-title">Edit property</h1>
            <p className="section-subtitle">Update the details for: {property?.title}</p>
          </div>
        </div>
        <div className={styles.formCard}>
          <PropertyForm
            initialValues={{ ...property, imageUrl: property?.images?.[0] || '' }}
            onSubmit={handleSubmit}
            submitLabel="Update Property"
          />
        </div>
      </div>
    </div>
  );
}
