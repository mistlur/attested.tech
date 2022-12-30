export const getDidPath = () => process.env.NEXT_PUBLIC_EXTERNAL_URL
export const getDidUri = () => `did:web:${getDidPath()}:api`
export const getCompleteDid = (id: string) => `${getDidUri()}:${id}`