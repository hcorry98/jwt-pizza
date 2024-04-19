import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/button';

export default function CreateStore() {
  const store = useLocation().state?.store || 'all';
  const navigate = useNavigate();

  function createStore() {
    alert(`Created store ${store}!`);
    navigate('/admin-dashboard');
  }

  function cancel() {
    navigate('/admin-dashboard');
  }

  return (
    <div>
      <div className='text-neutral-100'>
        Would you create the store <span className='font-bold text-yellow-300'>{store}</span>?
      </div>
      <Button title='Create' onPress={createStore} />
      <Button title='Cancel' onPress={cancel} />
    </div>
  );
}
