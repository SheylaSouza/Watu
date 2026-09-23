import { When } from '../../bdd/fixtures';

When('the client requests the service health', async ({ apiState, request }) => {
  apiState.operation = 'health';
  apiState.response = await request.get('/api/v1/health');
  apiState.body = await apiState.response.json();
});
