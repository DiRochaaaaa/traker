# 🔐 Configuração de Senha do App

## ⚠️ IMPORTANTE: Configure sua senha

Para proteger o acesso ao seu dashboard, você precisa configurar uma senha no arquivo `.env.local`:

### 1. Crie o arquivo `.env.local` na raiz do projeto

### 2. Adicione a variável de ambiente:

```env
# Sua senha de acesso ao app
AUTH_PASSWORD=SuaSenhaSecreta123
```

### 3. Substitua `SuaSenhaSecreta123` pela sua senha desejada

⚠️ **IMPORTANTE**: 
- Use uma senha forte e segura
- Não compartilhe esta senha
- O arquivo `.env.local` não deve ser commitado no git

## 🚀 Como funciona

1. **Primeira vez**: Digite a senha na tela de login
2. **Após login**: Fica salvo no localStorage para sempre
3. **Proteção**: Ninguém mais consegue acessar sem a senha

## 🔄 Para deslogar

Se quiser "deslogar" e forçar nova autenticação:
1. Abra o DevTools do navegador (F12)
2. Vá na aba "Application" > "Local Storage"
3. Delete as chaves `tracker_authenticated` e `tracker_auth_time`

## 🛡️ Segurança

- A senha fica apenas no servidor (.env.local)
- O localStorage só guarda que você está autenticado
- A verificação é feita sempre no servidor 