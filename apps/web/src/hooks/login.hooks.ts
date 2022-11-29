import { useMutation } from 'react-query';

function useLoginMutation() {
  return useMutation(['foo'], () => {
    console.log('loggedIn');
  });
}

export { useLoginMutation };
