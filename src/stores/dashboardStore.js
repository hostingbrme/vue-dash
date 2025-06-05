import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId, getServerCategoryDisplayName } from '@/utils/helpers.js' // Import helpers

export const useDashboardStore = defineStore('dashboard', () => {
  // --- State ---
  const isLoading = ref(true)
  const currentView = ref('home') // 'home', 'serversDashboard', 'sitesGlobal'
  const allRawData = ref([]) // Holds servers and potentially other top-level items
  const globalSearchQuery = ref('')
  const siteSearchQuery = ref('')
  const selectedServerCategoryFilter = ref('ALL') // 'ALL', 'FILE_SERVER', etc.
  const selectedServer = ref(null) // Holds the full server object when selected for detail view
  const detailedSite = ref(null) // Holds the site object for the details modal
  const showPasswordsPerSection = ref({}) // Tracks password visibility { key: boolean }

  // Modal State & Data
  const showAddServerModal = ref(false)
  const isEditModeServer = ref(false)
  const newServerDefaults = {
    type: 'server',
    title: '',
    serverCategory: 'GENERIC',
    link: '',
    port: '',
    login: '',
    password: '',
    customFields: [],
    isFixed: false,
    showOnMural: false,
    sites: undefined, // Only for FILE_SERVER
    mxRecords: [],
    rawMxRecords: '', // Only for EMAIL_SERVICE
  }
  const newServerData = ref({ ...newServerDefaults })

  const showAddSiteModal = ref(false)
  const isEditModeSite = ref(false)
  const newSiteDefaultData = {
    id: null,
    domainName: '',
    adminUser: 'preencher',
    adminPassword: 'preencher',
    associatedDbServerId: '',
    associatedEmailServiceId: '',
    rawEmailMxRecords: '',
    associatedReverseProxyId: '',
    associatedBackupServerId: '',
    customFields: [],
    targetFileServerId: null,
    originalTargetFileServerId: null,
    targetFileServerName: '',
  }
  const newSiteData = ref({ ...newSiteDefaultData })

  const emailProviderOptions = ref([
    'Pixel',
    'Heracles',
    'Mailgun',
    'Zoho Mail',
    'Hostinger Mail',
    'Outro',
  ])

  // --- Getters (Computeds) ---
  const allServers = computed(() => allRawData.value.filter((item) => item.type === 'server'))

  const getAssociatedServerDetails = (serverId) => {
    if (!serverId || !allServers.value) return null
    return allServers.value.find((s) => s.id === serverId)
  }

  const filteredServers = computed(() => {
    if (!allServers.value) return []
    if (selectedServerCategoryFilter.value === 'ALL') return allServers.value
    return allServers.value.filter((s) => s.serverCategory === selectedServerCategoryFilter.value)
  })

  const allSitesFlattened = computed(() => {
    const sites = []
    if (!allServers.value) return sites
    const fileServers = allServers.value.filter((s) => s.serverCategory === 'FILE_SERVER')
    fileServers.forEach((group) => {
      if (Array.isArray(group.sites)) {
        group.sites.forEach((site) => {
          const bdServerDetails = getAssociatedServerDetails(site.associatedDbServerId)
          const reverseProxyDetails = getAssociatedServerDetails(site.associatedReverseProxyId)
          sites.push({
            ...site,
            groupName: group.title,
            groupId: group.id,
            displayBdLink: bdServerDetails
              ? bdServerDetails.link
              : site.associatedDbServerId || 'N/A',
            displayReverseProxyLink: reverseProxyDetails
              ? reverseProxyDetails.link
              : site.associatedReverseProxyId || 'N/A',
          })
        })
      }
    })
    return sites
  })

  const stats = computed(() => {
    if (!allServers.value || !allSitesFlattened.value)
      return {
        totalFileServers: 0,
        totalSites: 0,
        totalBdServers: 0,
        totalReverseProxyServers: 0,
        totalBackupServers: 0,
        totalGenericServers: 0,
        totalEmailServicesProviders: 0,
      }
    const getCategoryCount = (category) =>
      allServers.value.filter((s) => s.serverCategory === category).length
    return {
      totalFileServers: getCategoryCount('FILE_SERVER'),
      totalSites: allSitesFlattened.value.length,
      totalBdServers: getCategoryCount('DB_SERVER'),
      totalReverseProxyServers: getCategoryCount('REVERSE_PROXY_SERVER'),
      totalBackupServers: getCategoryCount('BACKUP_SERVER'),
      totalGenericServers: getCategoryCount('GENERIC'),
      totalEmailServicesProviders: getCategoryCount('EMAIL_SERVICE'),
    }
  })

  const allSitesFiltered = computed(() => {
    if (!allSitesFlattened.value || allSitesFlattened.value.length === 0) return []
    if (!siteSearchQuery.value.trim()) return allSitesFlattened.value
    const query = siteSearchQuery.value.toLowerCase().trim()
    return allSitesFlattened.value.filter(
      (site) =>
        (site.domainName && site.domainName.toLowerCase().includes(query)) ||
        (site.groupName && site.groupName.toLowerCase().includes(query)) ||
        (site.displayBdLink && String(site.displayBdLink).toLowerCase().includes(query)) ||
        (site.displayReverseProxyLink &&
          String(site.displayReverseProxyLink).toLowerCase().includes(query)),
    )
  })

  const availableFileServers = computed(() =>
    allServers.value.filter((s) => s.serverCategory === 'FILE_SERVER'),
  )
  const availableDbServers = computed(() =>
    allServers.value.filter((s) => s.serverCategory === 'DB_SERVER'),
  )
  const availableReverseProxyServers = computed(() =>
    allServers.value.filter((s) => s.serverCategory === 'REVERSE_PROXY_SERVER'),
  )
  const availableBackupServers = computed(() =>
    allServers.value.filter((s) => s.serverCategory === 'BACKUP_SERVER'),
  )
  const availableEmailServices = computed(() =>
    allServers.value.filter((s) => s.serverCategory === 'EMAIL_SERVICE'),
  )

  const selectedEmailServiceForSite = computed(() => {
    if (newSiteData.value.associatedEmailServiceId && availableEmailServices.value.length > 0) {
      return availableEmailServices.value.find(
        (s) => s.id === newSiteData.value.associatedEmailServiceId,
      )
    }
    return null
  })

  const currentServerCategoryViewTitle = computed(() => {
    return getServerCategoryDisplayName(selectedServerCategoryFilter.value)
  })

  // --- Actions (Methods) ---

  // Data Persistence
  // Data Persistence
  async function loadData() {
    console.log('loadData action called - Fetching from Cloudflare Function')
    isLoading.value = true
    try {
      // Chama a Function GET /api/data
      const response = await fetch('/api/data') // Rota relativa para a Function
      if (!response.ok) {
        throw new Error(`Falha ao buscar dados da API: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      if (!Array.isArray(data)) {
        // Mesmo que a API retorne [], valida aqui por segurança
        console.warn('API retornou dados em formato inesperado, usando array vazio.')
        allRawData.value = []
      } else {
        allRawData.value = data
      }
      console.log('Dados carregados com sucesso via API:', allRawData.value.length, 'items')
    } catch (error) {
      console.error('Erro ao carregar dados via API:', error)
      alert('Falha ao carregar dados: ' + error.message)
      allRawData.value = [] // Garante que fique vazio em caso de erro
    } finally {
      isLoading.value = false
    }
  }

  async function saveData() {
    console.log('saveData action called - Sending to Cloudflare Function')
    isLoading.value = true
    try {
      // Chama a Function PUT /api/data, enviando o estado atual
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Envia uma cópia profunda do estado atual para evitar problemas de reatividade
        body: JSON.stringify(allRawData.value),
      })

      if (!response.ok) {
        // Tenta ler a mensagem de erro do corpo, se houver
        let errorBody = 'Erro desconhecido'
        try {
          errorBody = await response.text()
        } catch (e) {
          /* Ignora erro ao ler corpo */
        }
        throw new Error(
          `Falha ao salvar dados via API: ${response.status} ${response.statusText} - ${errorBody}`,
        )
      }

      const result = await response.json()
      console.log('Dados salvos via API:', result.message)
      // Opcional: Mostrar notificação de sucesso para o usuário
      // alert("Dados salvos com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar dados via API:', error)
      alert('Falha ao salvar dados: ' + error.message)
      // Considerar se deve reverter alguma mudança local ou tentar novamente
    } finally {
      isLoading.value = false
    }
  }

  async function saveData() {
    console.log('saveData action called')
    isLoading.value = true
    try {
      // TODO: Replace with actual fetch to Cloudflare Function/KV to save allRawData.value
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      console.log('Data saved (simulated)')
      // Optionally: show success message
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Falha ao salvar dados: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Navigation & UI State
  function setView(viewName, filterCategory = 'ALL') {
    currentView.value = viewName
    if (viewName === 'serversDashboard') {
      selectedServerCategoryFilter.value = filterCategory
    }
    selectedServer.value = null
    detailedSite.value = null
    // Consider using router.push() here instead of currentView if using Vue Router properly
  }

  function goHome() {
    setView('home')
    // router.push('/')
  }

  function selectServerForDetail(server) {
    selectedServer.value = server
    detailedSite.value = null
    // Maybe navigate to a server detail route?
  }

  function viewSiteDetails(siteParam) {
    // Logic to find groupName/groupId might need adjustment based on component context
    detailedSite.value = { ...siteParam }
    if (
      detailedSite.value.adminPassword &&
      typeof showPasswordsPerSection.value[detailedSite.value.id + '_modal'] === 'undefined'
    ) {
      showPasswordsPerSection.value[detailedSite.value.id + '_modal'] = false
    }
    // This probably should open a modal component, not just set state
  }

  function closeSiteDetailsModal() {
    detailedSite.value = null
  }

  function togglePasswordVisibility(key) {
    showPasswordsPerSection.value[key] = !showPasswordsPerSection.value[key]
  }

  function performGlobalSearch() {
    if (globalSearchQuery.value.trim()) {
      setView('sitesGlobal') // Navigate to site list view
      siteSearchQuery.value = globalSearchQuery.value // Pass the query
      // router.push({ name: 'SiteSearch', query: { q: globalSearchQuery.value } })
    }
  }

  // Server Modal Actions
  function openAddServerModal(category = 'GENERIC') {
    isEditModeServer.value = false
    newServerData.value = {
      ...newServerDefaults,
      serverCategory: category === 'ALL' ? 'GENERIC' : category,
      customFields: [],
    }
    updateNewServerPortDefault(newServerData.value) // Pass the object directly
    if (newServerData.value.serverCategory === 'FILE_SERVER') {
      newServerData.value.sites = []
    } else {
      delete newServerData.value.sites
    }
    showAddServerModal.value = true
  }

  function openEditServerModal(serverToEdit) {
    isEditModeServer.value = true
    // Deep copy to avoid modifying original data directly
    newServerData.value = JSON.parse(JSON.stringify(serverToEdit))
    if (!Array.isArray(newServerData.value.customFields)) {
      newServerData.value.customFields = []
    }
    if (
      newServerData.value.serverCategory === 'FILE_SERVER' &&
      !Array.isArray(newServerData.value.sites)
    ) {
      newServerData.value.sites = [] // Ensure sites array exists for File Servers
    }
    if (newServerData.value.serverCategory !== 'FILE_SERVER') {
      delete newServerData.value.sites // Remove sites if not a File Server
    }
    updateNewServerPortDefault(newServerData.value)
    showAddServerModal.value = true
  }

  function closeAddServerModal() {
    showAddServerModal.value = false
    isEditModeServer.value = false
    // Reset form data?
    // newServerData.value = { ...newServerDefaults };
  }

  function updateNewServerPortDefault(serverDataObj) {
    // Expects the raw object
    if (serverDataObj.serverCategory === 'DB_SERVER') {
      serverDataObj.port = serverDataObj.port || '3306'
    } else {
      delete serverDataObj.port
    }
    if (serverDataObj.serverCategory === 'EMAIL_SERVICE') {
      if (!Array.isArray(serverDataObj.mxRecords)) serverDataObj.mxRecords = []
      serverDataObj.rawMxRecords = Array.isArray(serverDataObj.mxRecords)
        ? serverDataObj.mxRecords.join('\n')
        : ''
    } else {
      delete serverDataObj.mxRecords
      delete serverDataObj.rawMxRecords
    }
    if (
      serverDataObj.serverCategory === 'EMAIL_SERVICE' ||
      serverDataObj.serverCategory === 'REVERSE_PROXY_SERVER'
    ) {
      serverDataObj.login = serverDataObj.login !== undefined ? serverDataObj.login : 'n/a'
      serverDataObj.password = serverDataObj.password !== undefined ? serverDataObj.password : 'n/a'
    } else {
      if (serverDataObj.login === undefined) serverDataObj.login = ''
      if (serverDataObj.password === undefined) serverDataObj.password = ''
    }
  }

  function addServerCustomField() {
    if (!Array.isArray(newServerData.value.customFields)) {
      newServerData.value.customFields = []
    }
    newServerData.value.customFields.push({ id: generateId('cf_srv'), label: '', value: '' })
  }

  function removeServerCustomField(index) {
    if (Array.isArray(newServerData.value.customFields)) {
      newServerData.value.customFields.splice(index, 1)
    }
  }

  async function handleSubmitServerForm() {
    let missingFields = []
    if (!newServerData.value.title) missingFields.push('Nome (Título)')
    if (newServerData.value.serverCategory !== 'EMAIL_SERVICE' && !newServerData.value.link)
      missingFields.push('Link/IP')
    if (
      newServerData.value.serverCategory !== 'EMAIL_SERVICE' &&
      newServerData.value.serverCategory !== 'REVERSE_PROXY_SERVER'
    ) {
      if (!newServerData.value.login) missingFields.push('Login')
      if (!newServerData.value.password) missingFields.push('Senha')
    }
    if (missingFields.length > 0) {
      alert('Preencha: ' + missingFields.join(', ') + '.')
      return
    }

    // Deep copy and clean up object before saving
    const serverObjectToSave = JSON.parse(JSON.stringify(newServerData.value))

    if (serverObjectToSave.serverCategory === 'EMAIL_SERVICE') {
      serverObjectToSave.mxRecords = (serverObjectToSave.rawMxRecords || '')
        .split('\n')
        .map((mx) => mx.trim())
        .filter((mx) => mx)
      delete serverObjectToSave.rawMxRecords
      delete serverObjectToSave.port
      delete serverObjectToSave.sites
    } else if (serverObjectToSave.serverCategory === 'REVERSE_PROXY_SERVER') {
      delete serverObjectToSave.port
      delete serverObjectToSave.sites
    } else {
      if (serverObjectToSave.serverCategory !== 'DB_SERVER') delete serverObjectToSave.port
      if (serverObjectToSave.serverCategory !== 'FILE_SERVER') delete serverObjectToSave.sites
      else if (
        serverObjectToSave.serverCategory === 'FILE_SERVER' &&
        !Array.isArray(serverObjectToSave.sites)
      )
        serverObjectToSave.sites = []
    }

    if (isEditModeServer.value) {
      const index = allRawData.value.findIndex((s) => s.id === serverObjectToSave.id)
      if (index !== -1) {
        // Preserve sites array if editing a File Server
        if (
          allRawData.value[index].serverCategory === 'FILE_SERVER' &&
          serverObjectToSave.serverCategory === 'FILE_SERVER'
        ) {
          serverObjectToSave.sites = allRawData.value[index].sites || []
        }
        allRawData.value.splice(index, 1, serverObjectToSave)
      } else {
        alert('Erro: Servidor não encontrado para edição.')
        return
      }
    } else {
      serverObjectToSave.id = generateId()
      allRawData.value.push(serverObjectToSave)
    }

    await saveData() // Persist changes
    closeAddServerModal()

    // Update selected server view if it was the one edited
    if (
      isEditModeServer.value &&
      selectedServer.value &&
      selectedServer.value.id === serverObjectToSave.id
    ) {
      selectServerForDetail(serverObjectToSave)
    }
    // Navigate to the category view if adding a new server
    else if (!isEditModeServer.value) {
      setView('serversDashboard', serverObjectToSave.serverCategory)
    }
  }

  function getSitesAssociatedWithServer(serverId) {
    const sites = []
    if (!serverId || !allSitesFlattened.value) return sites
    allSitesFlattened.value.forEach((site) => {
      if (
        site.associatedDbServerId === serverId ||
        site.associatedReverseProxyId === serverId ||
        site.associatedBackupServerId === serverId ||
        site.associatedEmailServiceId === serverId
      ) {
        sites.push(site)
      }
    })
    return sites
  }

  async function confirmDeleteServer(serverToDelete) {
    if (!serverToDelete || !serverToDelete.id) {
      alert('Servidor inválido.')
      return
    }
    let confirmMessage = `Excluir \"${serverToDelete.title}\"? Ação irreversível.`
    const associatedSites = getSitesAssociatedWithServer(serverToDelete.id)

    if (serverToDelete.serverCategory === 'FILE_SERVER') {
      const siteCount = serverToDelete.sites ? serverToDelete.sites.length : 0
      confirmMessage = `Excluir File Server \"${serverToDelete.title}\"? TODOS os ${siteCount} site(s) contidos nele também serão REMOVIDOS. Certeza?`
    } else if (associatedSites.length > 0) {
      confirmMessage = `Atenção: \"${serverToDelete.title}\" está associado a ${associatedSites.length} site(s). Excluí-lo removerá essas associações. Continuar?`
    }

    if (confirm(confirmMessage)) {
      await handleDeleteServer(serverToDelete.id, serverToDelete.serverCategory)
    }
  }

  async function handleDeleteServer(serverId, serverCategory) {
    const serverIndex = allRawData.value.findIndex((s) => s.id === serverId)
    if (serverIndex === -1) {
      alert('Servidor não encontrado.')
      return
    }
    const deletedServerTitle = allRawData.value[serverIndex].title

    // Remove the server itself
    allRawData.value.splice(serverIndex, 1)

    // If it wasn't a File Server, remove associations from sites within File Servers
    if (serverCategory !== 'FILE_SERVER') {
      let dataWasModified = false
      const updatedAllRawData = JSON.parse(JSON.stringify(allRawData.value)) // Work on a copy

      updatedAllRawData.forEach((fs) => {
        if (
          fs.type === 'server' &&
          fs.serverCategory === 'FILE_SERVER' &&
          Array.isArray(fs.sites)
        ) {
          fs.sites.forEach((site) => {
            let siteModifiedInLoop = false
            if (site.associatedDbServerId === serverId) {
              site.associatedDbServerId = null
              siteModifiedInLoop = true
            }
            if (site.associatedReverseProxyId === serverId) {
              site.associatedReverseProxyId = null
              siteModifiedInLoop = true
            }
            if (site.associatedBackupServerId === serverId) {
              site.associatedBackupServerId = null
              siteModifiedInLoop = true
            }
            if (site.associatedEmailServiceId === serverId) {
              site.associatedEmailServiceId = null
              siteModifiedInLoop = true
            }
            if (siteModifiedInLoop) dataWasModified = true
          })
        }
      })

      // If associations were removed, update the main state
      if (dataWasModified) {
        allRawData.value = updatedAllRawData
      }
    }

    await saveData() // Persist changes

    // Reset UI state if the deleted server was selected
    if (selectedServer.value && selectedServer.value.id === serverId) {
      selectedServer.value = null
    }
    detailedSite.value = null // Always clear detailed site view after deletion

    alert(`Servidor \"${deletedServerTitle}\" (ID: \"${serverId}\") excluído.`)
  }

  // Site Modal Actions
  function openAddSiteModal(fileServer) {
    if (!fileServer || fileServer.serverCategory !== 'FILE_SERVER') {
      alert('Selecione um File Server válido.')
      return
    }
    isEditModeSite.value = false
    newSiteData.value = {
      ...newSiteDefaultData,
      targetFileServerId: fileServer.id,
      originalTargetFileServerId: fileServer.id,
      targetFileServerName: fileServer.title,
      customFields: [],
    }
    showAddSiteModal.value = true
  }

  function openEditSiteModal(siteToEdit) {
    const parentFileServerId = siteToEdit.groupId // Assuming groupId is passed correctly
    if (!parentFileServerId) {
      alert('ID do File Server pai não encontrado no objeto do site.')
      console.error('openEditSiteModal: Site sem groupId:', JSON.parse(JSON.stringify(siteToEdit)))
      return
    }
    const parentFileServer = allServers.value.find(
      (s) => s.id === parentFileServerId && s.serverCategory === 'FILE_SERVER',
    )
    if (!parentFileServer) {
      alert(`File Server pai (ID: ${parentFileServerId}) não encontrado.`)
      return
    }

    isEditModeSite.value = true
    const siteCopy = JSON.parse(JSON.stringify(siteToEdit)) // Deep copy

    newSiteData.value = {
      id: siteCopy.id,
      domainName: siteCopy.domainName || '',
      adminUser: siteCopy.adminUser || 'preencher',
      adminPassword: siteCopy.adminPassword || 'preencher',
      associatedDbServerId: siteCopy.associatedDbServerId || '',
      associatedEmailServiceId: siteCopy.associatedEmailServiceId || '',
      rawEmailMxRecords: '', // Will be populated below if needed
      associatedReverseProxyId: siteCopy.associatedReverseProxyId || '',
      associatedBackupServerId: siteCopy.associatedBackupServerId || '',
      customFields: Array.isArray(siteCopy.customFields)
        ? JSON.parse(JSON.stringify(siteCopy.customFields))
        : [],
      targetFileServerId: parentFileServer.id, // Current parent
      originalTargetFileServerId: parentFileServer.id, // Store original parent
      targetFileServerName: parentFileServer.title,
    }

    // Populate raw MX records if no email service is associated
    if (!newSiteData.value.associatedEmailServiceId && Array.isArray(siteCopy.emailMxRecords)) {
      newSiteData.value.rawEmailMxRecords = siteCopy.emailMxRecords.join(', ')
    }

    // Close detail view if open
    if (detailedSite.value && detailedSite.value.id === siteToEdit.id) {
      detailedSite.value = null
    }
    showAddSiteModal.value = true
  }

  function closeAddSiteModal() {
    showAddSiteModal.value = false
    isEditModeSite.value = false
    // Reset form data?
    // newSiteData.value = { ...newSiteDefaultData };
  }

  function addSiteCustomField() {
    if (!Array.isArray(newSiteData.value.customFields)) {
      newSiteData.value.customFields = []
    }
    newSiteData.value.customFields.push({ id: generateId('cf_site'), label: '', value: '' })
  }

  function removeSiteCustomField(index) {
    if (Array.isArray(newSiteData.value.customFields)) {
      newSiteData.value.customFields.splice(index, 1)
    }
  }

  async function handleSubmitSiteForm() {
    if (!newSiteData.value.domainName?.trim()) {
      alert('Domínio é obrigatório.')
      return
    }
    if (!newSiteData.value.targetFileServerId) {
      alert('File Server de destino não especificado.')
      return
    }
    if (isEditModeSite.value && !newSiteData.value.id) {
      alert('ID do site ausente para edição.')
      return
    }

    // Determine final MX records
    let finalEmailMxRecords = []
    if (
      newSiteData.value.associatedEmailServiceId &&
      newSiteData.value.associatedEmailServiceId !== '_ADD_NEW_'
    ) {
      const emailService = getAssociatedServerDetails(newSiteData.value.associatedEmailServiceId)
      if (emailService && Array.isArray(emailService.mxRecords)) {
        finalEmailMxRecords = emailService.mxRecords
      }
    } else {
      finalEmailMxRecords = (newSiteData.value.rawEmailMxRecords || '')
        .split(',')
        .map((mx) => mx.trim())
        .filter((mx) => mx)
    }

    // Prepare site data object
    const siteEntryData = {
      domainName: newSiteData.value.domainName.trim(),
      adminUser: newSiteData.value.adminUser || 'preencher',
      adminPassword: newSiteData.value.adminPassword || 'preencher',
      associatedDbServerId: newSiteData.value.associatedDbServerId || null,
      associatedEmailServiceId: newSiteData.value.associatedEmailServiceId || null,
      emailMxRecords: finalEmailMxRecords,
      associatedReverseProxyId: newSiteData.value.associatedReverseProxyId || null,
      associatedBackupServerId: newSiteData.value.associatedBackupServerId || null,
      customFields: newSiteData.value.customFields || [],
    }

    const targetFileServerIndex = allRawData.value.findIndex(
      (s) => s.id === newSiteData.value.targetFileServerId && s.serverCategory === 'FILE_SERVER',
    )
    if (targetFileServerIndex === -1) {
      alert('File Server de destino não encontrado.')
      return
    }

    // Get a mutable copy of the target file server
    const fileServerToUpdate = JSON.parse(JSON.stringify(allRawData.value[targetFileServerIndex]))
    if (!Array.isArray(fileServerToUpdate.sites)) {
      fileServerToUpdate.sites = []
    }

    if (isEditModeSite.value) {
      const siteIdToUpdate = newSiteData.value.id
      const originalParentId = newSiteData.value.originalTargetFileServerId
      const newParentId = newSiteData.value.targetFileServerId

      // Handle potential move between file servers
      if (originalParentId && originalParentId !== newParentId) {
        const originalFileServerIndex = allRawData.value.findIndex((s) => s.id === originalParentId)
        if (originalFileServerIndex !== -1) {
          const fsOriginal = JSON.parse(JSON.stringify(allRawData.value[originalFileServerIndex]))
          if (Array.isArray(fsOriginal.sites)) {
            const siteOriginalIdx = fsOriginal.sites.findIndex((s) => s.id === siteIdToUpdate)
            if (siteOriginalIdx !== -1) {
              fsOriginal.sites.splice(siteOriginalIdx, 1)
              // Update the original server in the main array immediately
              allRawData.value.splice(originalFileServerIndex, 1, fsOriginal)
            }
          }
        }
      }

      // Update or add site in the target file server
      const siteIndexInTarget = fileServerToUpdate.sites.findIndex((s) => s.id === siteIdToUpdate)
      if (siteIndexInTarget !== -1) {
        // Update existing site
        fileServerToUpdate.sites[siteIndexInTarget] = {
          ...fileServerToUpdate.sites[siteIndexInTarget],
          ...siteEntryData,
          id: siteIdToUpdate,
        }
      } else {
        // Add site (if moved)
        fileServerToUpdate.sites.push({ ...siteEntryData, id: siteIdToUpdate })
      }
    } else {
      // Add new site
      const newSiteId = generateId('site')
      fileServerToUpdate.sites.push({ ...siteEntryData, id: newSiteId })
    }

    // Update the target file server in the main array
    allRawData.value.splice(targetFileServerIndex, 1, fileServerToUpdate)

    await saveData() // Persist changes
    closeAddSiteModal()

    // Update selected server view if it was the target
    if (selectedServer.value && selectedServer.value.id === newSiteData.value.targetFileServerId) {
      // Find the updated server data to refresh the view
      const updatedServer = allRawData.value.find((s) => s.id === selectedServer.value.id)
      if (updatedServer) selectServerForDetail(updatedServer)
    }
  }

  async function confirmDeleteSite(siteId, fileServerId) {
    if (!siteId || !fileServerId) {
      alert('ID do site ou File Server inválido.')
      return
    }
    const fileServer = allRawData.value.find((s) => s.id === fileServerId)
    if (!fileServer || !Array.isArray(fileServer.sites)) {
      alert('File Server não encontrado.')
      return
    }
    const site = fileServer.sites.find((s) => s.id === siteId)
    if (!site) {
      alert('Site não encontrado no File Server.')
      return
    }

    if (confirm(`Excluir o site \"${site.domainName}\" do File Server \"${fileServer.title}\"?`)) {
      await handleDeleteSite(siteId, fileServerId)
    }
  }

  async function handleDeleteSite(siteId, fileServerId) {
    const fileServerIndex = allRawData.value.findIndex((s) => s.id === fileServerId)
    if (fileServerIndex === -1) {
      alert('File Server não encontrado.')
      return
    }

    const fileServerToUpdate = JSON.parse(JSON.stringify(allRawData.value[fileServerIndex]))
    if (!Array.isArray(fileServerToUpdate.sites)) {
      alert('Estrutura de sites inválida.')
      return
    }

    const siteIndex = fileServerToUpdate.sites.findIndex((s) => s.id === siteId)
    if (siteIndex === -1) {
      alert('Site não encontrado para exclusão.')
      return
    }

    const deletedSiteName = fileServerToUpdate.sites[siteIndex].domainName
    fileServerToUpdate.sites.splice(siteIndex, 1)

    // Update the file server in the main array
    allRawData.value.splice(fileServerIndex, 1, fileServerToUpdate)

    await saveData() // Persist changes

    alert(`Site \"${deletedSiteName}\" excluído.`)

    // Update selected server view if it was the parent
    if (selectedServer.value && selectedServer.value.id === fileServerId) {
      selectServerForDetail(fileServerToUpdate)
    }
    // Close detail modal if this site was being viewed
    if (detailedSite.value && detailedSite.value.id === siteId) {
      detailedSite.value = null
    }
  }

  // --- Return everything ---
  return {
    // State
    isLoading,
    currentView,
    allRawData,
    globalSearchQuery,
    siteSearchQuery,
    selectedServerCategoryFilter,
    selectedServer,
    detailedSite,
    showPasswordsPerSection,
    showAddServerModal,
    isEditModeServer,
    newServerData,
    showAddSiteModal,
    isEditModeSite,
    newSiteData,
    emailProviderOptions,
    // Getters
    allServers,
    filteredServers,
    allSitesFlattened,
    stats,
    allSitesFiltered,
    availableFileServers,
    availableDbServers,
    availableReverseProxyServers,
    availableBackupServers,
    availableEmailServices,
    selectedEmailServiceForSite,
    currentServerCategoryViewTitle,
    // Actions
    loadData,
    saveData,
    setView,
    goHome,
    selectServerForDetail,
    viewSiteDetails,
    closeSiteDetailsModal,
    togglePasswordVisibility,
    performGlobalSearch,
    openAddServerModal,
    openEditServerModal,
    closeAddServerModal,
    addServerCustomField,
    removeServerCustomField,
    handleSubmitServerForm,
    confirmDeleteServer,
    handleDeleteServer,
    openAddSiteModal,
    openEditSiteModal,
    closeAddSiteModal,
    addSiteCustomField,
    removeSiteCustomField,
    handleSubmitSiteForm,
    confirmDeleteSite,
    handleDeleteSite,
    getSitesAssociatedWithServer,
  }
})
