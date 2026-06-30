const useUseful = () => {
  const brasilFormatData = (data) => { 
    if (data === undefined) return "Indefinido";

    const dataObject = new Date(data);

    const options = { 
        timeZone: "America/Sao_Paulo", 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false 
    };

    return new Intl.DateTimeFormat("pt-BR", options).format(dataObject).replace(",", "");
  }

  const countNotesOfValue1000 = (notes) => {
    return notes.filter(item => item.nota === 1000).length;
  }

  const avgNotes = (notes) => {
    return notes.reduce((soma, item) => soma + item.nota, 0) / notes.length
  }

  const getHeaders = () => {
    const storedUser = localStorage.getItem('user_access_data')
    if (!storedUser) return {}

    const { token } = JSON.parse(storedUser)
    return { Authorization: `Bearer ${token}` }
  }

  return { brasilFormatData, countNotesOfValue1000, avgNotes, getHeaders }
}

export default useUseful