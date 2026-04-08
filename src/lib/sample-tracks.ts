export interface Track {
  id: number;
  title: string;
  duration: string;
  category: string;
  audioUrl: string;
  downloadUrl: string;
}

export const sampleTracks: Track[] = [
  { id: 1, title: "Quando a Alma Chora", duration: "4:12", category: "Cura", audioUrl: "/audio/01-quando-a-alma-chora.mp3", downloadUrl: "/downloads/01-quando-a-alma-chora.mp3" },
  { id: 2, title: "No Silêncio da Madrugada", duration: "3:45", category: "Madrugada", audioUrl: "/audio/02-no-silencio-da-madrugada.mp3", downloadUrl: "/downloads/02-no-silencio-da-madrugada.mp3" },
  { id: 3, title: "Respira Deus Outra Vez", duration: "5:01", category: "Oração", audioUrl: "/audio/03-respira-deus-outra-vez.mp3", downloadUrl: "/downloads/03-respira-deus-outra-vez.mp3" },
  { id: 4, title: "Força Para Continuar", duration: "4:33", category: "Força", audioUrl: "/audio/04-forca-para-continuar.mp3", downloadUrl: "/downloads/04-forca-para-continuar.mp3" },
  { id: 5, title: "Cura o Que Ninguém Vê", duration: "3:58", category: "Cura", audioUrl: "/audio/05-cura-o-que-ninguem-ve.mp3", downloadUrl: "/downloads/05-cura-o-que-ninguem-ve.mp3" },
  { id: 6, title: "Paz em Meio ao Caos", duration: "4:20", category: "Paz", audioUrl: "/audio/06-paz-em-meio-ao-caos.mp3", downloadUrl: "/downloads/06-paz-em-meio-ao-caos.mp3" },
  { id: 7, title: "O Céu Ainda Me Vê", duration: "3:42", category: "Presença", audioUrl: "/audio/07-o-ceu-ainda-me-ve.mp3", downloadUrl: "/downloads/07-o-ceu-ainda-me-ve.mp3" },
  { id: 8, title: "Oração Sem Palavras", duration: "5:15", category: "Oração", audioUrl: "/audio/08-oracao-sem-palavras.mp3", downloadUrl: "/downloads/08-oracao-sem-palavras.mp3" },
  { id: 9, title: "Quando Só Deus Entende", duration: "4:08", category: "Refúgio", audioUrl: "/audio/09-quando-so-deus-entende.mp3", downloadUrl: "/downloads/09-quando-so-deus-entende.mp3" },
  { id: 10, title: "Refúgio no Secreto", duration: "3:55", category: "Refúgio", audioUrl: "/audio/10-refugio-no-secreto.mp3", downloadUrl: "/downloads/10-refugio-no-secreto.mp3" },
  { id: 11, title: "Ainda Estou de Pé", duration: "4:27", category: "Força", audioUrl: "/audio/11-ainda-estou-de-pe.mp3", downloadUrl: "/downloads/11-ainda-estou-de-pe.mp3" },
  { id: 12, title: "Luz na Noite Escura", duration: "3:39", category: "Madrugada", audioUrl: "/audio/12-luz-na-noite-escura.mp3", downloadUrl: "/downloads/12-luz-na-noite-escura.mp3" },
  { id: 13, title: "Acalma Minha Mente", duration: "4:50", category: "Paz", audioUrl: "/audio/13-acalma-minha-mente.mp3", downloadUrl: "/downloads/13-acalma-minha-mente.mp3" },
  { id: 14, title: "Meu Abrigo é Tua Presença", duration: "3:30", category: "Presença", audioUrl: "/audio/14-meu-abrigo-e-tua-presenca.mp3", downloadUrl: "/downloads/14-meu-abrigo-e-tua-presenca.mp3" },
  { id: 15, title: "Deus Está Aqui", duration: "5:22", category: "Presença", audioUrl: "/audio/15-deus-esta-aqui.mp3", downloadUrl: "/downloads/15-deus-esta-aqui.mp3" },
  { id: 16, title: "Mesmo Ferido, Eu Creio", duration: "4:15", category: "Força", audioUrl: "/audio/16-mesmo-ferido-eu-creio.mp3", downloadUrl: "/downloads/16-mesmo-ferido-eu-creio.mp3" },
  { id: 17, title: "Descanso Para o Coração", duration: "3:48", category: "Paz", audioUrl: "/audio/17-descanso-para-o-coracao.mp3", downloadUrl: "/downloads/17-descanso-para-o-coracao.mp3" },
  { id: 18, title: "Não Estou Sozinho", duration: "4:02", category: "Refúgio", audioUrl: "/audio/18-nao-estou-sozinho.mp3", downloadUrl: "/downloads/18-nao-estou-sozinho.mp3" },
  { id: 19, title: "Tua Paz Me Sustenta", duration: "5:10", category: "Paz", audioUrl: "/audio/19-tua-paz-me-sustenta.mp3", downloadUrl: "/downloads/19-tua-paz-me-sustenta.mp3" },
  { id: 20, title: "Canção Para Dias Difíceis", duration: "3:35", category: "Cura", audioUrl: "/audio/20-cancao-para-dias-dificeis.mp3", downloadUrl: "/downloads/20-cancao-para-dias-dificeis.mp3" },
  { id: 21, title: "Esperança no Vale", duration: "4:40", category: "Força", audioUrl: "/audio/21-esperanca-no-vale.mp3", downloadUrl: "/downloads/21-esperanca-no-vale.mp3" },
  { id: 22, title: "A Tua Voz Me Encontra", duration: "3:52", category: "Oração", audioUrl: "/audio/22-a-tua-voz-me-encontra.mp3", downloadUrl: "/downloads/22-a-tua-voz-me-encontra.mp3" },
  { id: 23, title: "Céu Sobre Mim", duration: "4:18", category: "Presença", audioUrl: "/audio/23-ceu-sobre-mim.mp3", downloadUrl: "/downloads/23-ceu-sobre-mim.mp3" },
  { id: 24, title: "Quando Eu Não Consigo Orar", duration: "5:05", category: "Oração", audioUrl: "/audio/24-quando-eu-nao-consigo-orar.mp3", downloadUrl: "/downloads/24-quando-eu-nao-consigo-orar.mp3" },
  { id: 25, title: "Perto em Meio à Dor", duration: "3:44", category: "Cura", audioUrl: "/audio/25-perto-em-meio-a-dor.mp3", downloadUrl: "/downloads/25-perto-em-meio-a-dor.mp3" },
  { id: 26, title: "Tua Presença é Meu Lugar", duration: "4:30", category: "Refúgio", audioUrl: "/audio/26-tua-presenca-e-meu-lugar.mp3", downloadUrl: "/downloads/26-tua-presenca-e-meu-lugar.mp3" },
  { id: 27, title: "Amanhecer da Alma", duration: "3:56", category: "Madrugada", audioUrl: "/audio/27-amanhecer-da-alma.mp3", downloadUrl: "/downloads/27-amanhecer-da-alma.mp3" },
  { id: 28, title: "Graça Para Recomeçar", duration: "4:22", category: "Cura", audioUrl: "/audio/28-graca-para-recomecar.mp3", downloadUrl: "/downloads/28-graca-para-recomecar.mp3" },
  { id: 29, title: "Segura Minha Mão", duration: "5:00", category: "Presença", audioUrl: "/audio/29-segura-minha-mao.mp3", downloadUrl: "/downloads/29-segura-minha-mao.mp3" },
  { id: 30, title: "Até Aqui, Deus Me Sustentou", duration: "6:12", category: "Força", audioUrl: "/audio/30-ate-aqui-deus-me-sustentou.mp3", downloadUrl: "/downloads/30-ate-aqui-deus-me-sustentou.mp3" },
];
