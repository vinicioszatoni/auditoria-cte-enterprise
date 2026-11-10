import { FloraProvider } from '@grupoboticario/flora-react/provider'
import { FloraContainer } from '@grupoboticario/flora-react/container'
import { FloraTypography } from '@grupoboticario/flora-react/typography'
import '@grupoboticario/flora-react/provider/reset.css'
import '@grupoboticario/flora-tokens/core/web/css'

import { appName } from './config/envs'
import { Logo } from './components/Logo'
import './styles/global.css'

function App() {
  return (
    <FloraProvider theme="core" themeMode="light">
      <FloraContainer
        centerContent
        size="large"
        css={{
          gap: 20,
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <Logo size="100" />

        <FloraTypography as="h1" fontSize="heading">
          Criado com Alquimia e Flora.ds
        </FloraTypography>

        <FloraTypography as="span">app name: {appName}</FloraTypography>
      </FloraContainer>
    </FloraProvider>
  )
}

export default App
