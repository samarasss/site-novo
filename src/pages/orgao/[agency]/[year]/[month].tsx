/* eslint-disable react/no-unescaped-entities */
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import ReactFrappeChart from 'react-frappe-charts';
import styled from 'styled-components';
import {
  EmailShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookShareButton,
  EmailIcon,
  TwitterIcon,
  WhatsappIcon,
  FacebookIcon,
} from 'react-share';
import MONTHS from '../../../../@types/MONTHS';
import ActivityIndicator from '../../../../components/ActivityIndicator';
import Button from '../../../../components/Button';
import F from '../../../../components/Footer';
import H from '../../../../components/Header';
import api from '../../../../services/api';

export default function OmaPage({
  agency,
  year,
  month,
  fullName,
  totalMembers,
  maxWage,
  totalWage,
  maxPerk,
  totalPerks,
  crawlingTime,
}) {
  const [previousButtonActive, setPreviousButtonActive] = useState(true);
  const [nextButtonActive, setNextButtonActive] = useState(true);
  const [chartData, setChartData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [fileLink, setFileLink] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  function getNextDate() {
    let m = parseInt(month, 10);
    let y = parseInt(year, 10);
    if (m === 12) {
      m = 1;
      y += 1;
    } else {
      m += 1;
    }
    return { m, y };
  }
  function getPreviousDate() {
    let m = parseInt(month, 10);
    let y = parseInt(year, 10);
    if (m === 1) {
      m = 12;
      y -= 1;
    } else {
      m -= 1;
    }
    return { m, y };
  }
  const router = useRouter();

  async function checkNextYear() {
    let activateButtonNext = true;
    const { m, y } = getNextDate();
    if (y !== undefined) {
      await api.get(`/orgao/salario/${agency}/${y}/${m}`).catch(_err => {
        activateButtonNext = false;
      });
      setNextButtonActive(activateButtonNext);
    }
  }
  async function checkPreviousYear() {
    let activateButtonPrevious = true;
    const { m, y } = getPreviousDate();
    if (y !== undefined) {
      await api.get(`/orgao/salario/${agency}/${y}/${m}`).catch(_err => {
        activateButtonPrevious = false;
      });
      setPreviousButtonActive(activateButtonPrevious);
    }
  }

  useEffect(() => {
    setLoading(true);
    checkNextYear();
    checkPreviousYear();
    fetchChartData();
  }, [year, month]);
  async function fetchChartData() {
    try {
      const { data } = await api.get(
        `/orgao/salario/${agency}/${year}/${month}`,
      );
      setChartData(data);
      setFileLink(data.PackageURL);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }
  function handleNavigateToNextSummaryOption() {
    const { m, y } = getNextDate();
    setLoading(true);
    router.push(`/orgao/${agency}/${y}/${m}`);
  }
  function handleNavigateToPreviousSummaryOption() {
    const { m, y } = getPreviousDate();
    setLoading(true);
    router.push(`/orgao/${agency}/${y}/${m}`);
  }

  return (
    <Page>
      <Head>
        <title>OMA/{agency.toUpperCase()}</title>
        <meta property="og:image" content="/img/icon_dadosjus_background.png" />
        <meta
          property="og:title"
          content={`Veja os dados do mês ${month} no ano ${year} na agência ${fullName}`}
        />
        <meta
          property="og:description"
          content="DadosJusBr é uma plataforma que realiza a libertação continua de dados de remuneração de sistema de justiça brasileiro"
        />
      </Head>
      <Header theme="LIGHT" />
      <MainGraphSection>
        <MainGraphSectionHeader>
          <h2>
            {fullName} ({agency.toLocaleUpperCase('pt')})
          </h2>
          <div>
            <button
              className="left"
              onClick={() => handleNavigateToPreviousSummaryOption()}
              type="button"
              disabled={!previousButtonActive}
            >
              <img src="/img/arrow.svg" alt="arrow" />
            </button>
            <span>
              {MONTHS[month]}, {year}
            </span>
            <button
              onClick={() => handleNavigateToNextSummaryOption()}
              type="button"
              disabled={!nextButtonActive}
            >
              <img src="/img/arrow.svg" alt="arrow" />
            </button>
          </div>
          {loading || (
            <span>
              Dados capturados em{' '}
              {(() => {
                const d = new Date(crawlingTime);
                // eslint-disable-next-line prettier/prettier
                return `${d.getDay()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
              })()}
            </span>
          )}
        </MainGraphSectionHeader>
        {loading ? (
          <ActivityIndicatorPlaceholder fontColor="#3e5363">
            <ActivityIndicator spinnerColor="#3e5363" />
            <span>Carregando dados...</span>
          </ActivityIndicatorPlaceholder>
        ) : (
          <>
            <Captions>
              <div>
                <span className="info">
                  <img src="/img/icon_info.svg" alt="info" />
                  <div>
                    <span>
                      <b>Salário:</b> valor recebido de acordo com a prestação
                      de serviços, em decorrência do contrato de trabalho.
                      <br />
                      <br />
                      <b>Remuneração:</b> é a soma do salário mais outras
                      vantagens (indenizações e benefícios). - Benefício:
                      valores eventuais, por exemplo, auxílios alimentação,
                      saúde, escolar... - Membro: é o integrante da carreira
                      'principal' do órgão do sistema de justiça. Por exemplo,
                      juízes, desembargadores, ministros, defensores,
                      procuradores públicos, promotores de justiça, procuradores
                      de justiça, etc...
                    </span>
                  </div>
                </span>
                <span>
                  <h3>{totalMembers} Membros</h3>
                </span>
                <span>
                  <img src="/img/anim-group-2/icon_salario.svg" alt="sallary" />
                </span>
              </div>
              <ul>
                <CaptionItems>
                  <img src="/img/anim-group-2/icon_salario.svg" alt="sallary" />
                  <div>
                    <span>Maior salário: R$ {maxWage.toFixed(2)}</span>
                    <span>Total Salários: R$ {totalWage.toFixed(2)}</span>
                  </div>
                </CaptionItems>
                <CaptionItems>
                  <img
                    src="/img/anim-group-2/icon_beneficio.svg"
                    alt="benefits"
                  />
                  <div>
                    <span>Maior Benefício: R$ {maxPerk.toFixed(2)}</span>
                    <span>Total benefícios: R$ {totalPerks.toFixed(2)}</span>
                  </div>
                </CaptionItems>
              </ul>
            </Captions>
            <Modal
              isOpen={modalIsOpen}
              onAfterOpen={() => {
                console.log('abriu');
              }}
              onRequestClose={() => {
                setModalIsOpen(false);
              }}
              style={{
                content: {
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  bottom: 'auto',
                  width: '40rem',
                  height: '20rem',
                  marginRight: '-50%',
                  borderRadius: '0',
                  backgroundColor: '#CED9E1',
                  transform: 'translate(-50%, -50%)',
                },
              }}
              contentLabel="Example Modal"
            >
              <ModalDiv>
                <span>
                  <h2>Compartilhar</h2>
                  <img src="/img/icon_share.svg" alt="share" />
                </span>
                <div>
                  <EmailShareButton url={window.location.href}>
                    <EmailIcon />
                  </EmailShareButton>
                  <TwitterShareButton url={window.location.href}>
                    <TwitterIcon />
                  </TwitterShareButton>
                  <WhatsappShareButton url={window.location.href}>
                    <WhatsappIcon />
                  </WhatsappShareButton>
                  <FacebookShareButton url={window.location.href}>
                    <FacebookIcon />
                  </FacebookShareButton>
                </div>
              </ModalDiv>
            </Modal>
            <GraphDivWithPagination>
              <h3>Total de Remunerações de Membros por Mês em {year}</h3>
              <div className="main-chart-wrapper">
                {!chartData.Members ? (
                  <ActivityIndicatorPlaceholder fontColor="#3e5363">
                    <span>Não há dados de membros para esse mês</span>
                  </ActivityIndicatorPlaceholder>
                ) : (
                  <ReactFrappeChart
                    {...{
                      data: {
                        labels: [
                          '> R$ 50 mil',
                          'R$ 40~50 mil',
                          'R$ 30~40 mil',
                          'R$ 20~30 mil',
                          'R$ 10~20 mil',
                          'R$ 10 mil',
                        ],
                        datasets: [
                          {
                            name: 'Benefícios',
                            chartType: 'bar',
                            values: [
                              chartData.Members['-1'],
                              chartData.Members['50000'],
                              chartData.Members['40000'],
                              chartData.Members['30000'],
                              chartData.Members['20000'],
                              chartData.Members['10000'],
                            ],
                          },
                        ],
                      },
                      type: 'bar', // or 'bar', 'line', 'pie', 'percentage'
                      height: 300,
                      axisOptions: {
                        xAxisMode: 'tick',
                      },
                      colors: ['#B361C6'],
                      barOptions: {
                        stacked: 1,
                        spaceRatio: 0.6,
                      },
                      tooltipOptions: {
                        formatTooltipX: d => '',
                        formatTooltipY: d => `${d} Membros`,
                      },
                    }}
                  />
                )}
              </div>
              <div className="buttons">
                <div>
                  <a href="/dados/PB">
                    <Button
                      textColor="#2FBB96"
                      borderColor="#2FBB96"
                      backgroundColor="#fff"
                      hoverBackgroundColor="#2FBB96"
                      className="left"
                    >
                      Voltar par anos
                      <img
                        src="/img/icon_calendario_green.svg"
                        alt="callendar"
                      />
                    </Button>
                  </a>
                </div>
                <div>
                  <Button
                    textColor="#3e5363"
                    borderColor="#3e5363"
                    backgroundColor="#fff"
                    hoverBackgroundColor="#3e5363"
                    onClick={() => setModalIsOpen(true)}
                  >
                    Compartilhar
                    <img src="/img/icon_share.svg" alt="share" />
                  </Button>
                  <a href={fileLink}>
                    <Button
                      textColor="#3e5363"
                      borderColor="#3e5363"
                      backgroundColor="#fff"
                      hoverBackgroundColor="#3e5363"
                    >
                      Baixar
                      <img src="/img/icon_download_share.svg" alt="download" />
                    </Button>
                  </a>
                </div>
              </div>
            </GraphDivWithPagination>
          </>
        )}
      </MainGraphSection>
      <Footer theme="LIGHT" />
    </Page>
  );
}
export const getServerSideProps: GetServerSideProps = async context => {
  const { agency, year, month } = context.params;
  try {
    // const { data: d1 } = await api.get(`/orgao/totais/${agency}/${year}`);

    const { data: d2 } = await api.get(
      `/orgao/resumo/${agency}/${year}/${month}`,
    );
    return {
      props: {
        agency,
        year,
        month,
        fullName: d2.FullName,
        totalMembers: d2.TotalMembers,
        maxWage: d2.MaxWage,
        totalWage: d2.TotalWage,
        maxPerk: d2.MaxPerk,
        totalPerks: d2.TotalPerks,
        crawlingTime: d2.CrawlingTime,
      },
    };
  } catch (err) {
    // context.res.writeHead(301, {
    //   Location: `/`,
    // });
    // context.res.end();
    return { props: {} };
  }
};
const Page = styled.div`
  background: #fff;
`;

const MainGraphSection = styled.section`
  margin-top: 3rem;
  @media (max-width: 600px) {
    padding: 1rem;
  }
  @media (min-width: 600px) {
    margin-bottom: 4rem;
    margin-left: 8rem;
    margin-right: 8rem;
  }
  text-align: center;
  font-size: 4rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto Condensed', sans-serif;
  .buttons {
    justify-content: space-between;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    div {
      @media (max-width: 600px) {
        justify-content: center;
      }
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      & + div {
        button:hover {
          img {
            filter: brightness(0) invert(1);
          }
        }
      }
    }
    @media (max-width: 600px) {
      justify-content: center;
    }
    button {
      font-size: 2rem;
      margin: 1rem;
      position: relative;
      img {
        right: 3rem;
        position: absolute;
      }
    }
  }
`;
const MainGraphSectionHeader = styled.div`
  font-size: 4rem;
  color: #3e5363;
  display: flex;
  width: 35rem;
  flex-direction: column;
  align-items: center;
  align-self: center;
  h2 {
    margin-bottom: 1rem;
    font-size: 3rem;
  }
  span {
    margin-top: 2rem;
    font-size: 2rem;
    font-weight: 400;
  }
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 80%;
    button {
      &.left {
        transform: rotate(180deg);
      }
      img {
        position: initial;
      }
      width: 30px;
      color: #3e5363;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: none;
      background-color: #3e5363;
      &:disabled,
      &[disabled] {
        border: 2px solid #3e5363;
        img {
          filter: invert(75%) sepia(56%) saturate(285%) hue-rotate(163deg)
            brightness(87%) contrast(84%);
        }
        background-color: #fff;
      }
    }
    span {
      img {
        position: initial;
      }
      font-size: 2rem;
      font-weight: bold;
    }
  }
  margin-bottom: 4.5rem;
`;
const Captions = styled.div`
  padding: 2rem;
  width: 100%;
  min-width: 34rem;
  justify-content: center;
  color: #3e5363;
  background: rgba(62, 83, 99, 0.05);
  div {
    padding: 0 1rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    span {
      &.info {
        position: relative;
        div {
          background-color: #ced9e1;
          color: #3e5363;
          width: 800%;
          z-index: 100;
          padding: 2rem;
          font-size: 2rem;
          text-align: left;
          b {
            font-size: 1.5rem;
          }
          display: none;
          position: absolute;
        }
        &:hover {
          div {
            display: block;
          }
        }
      }
      h3 {
        text-align: center;
        font-size: 2rem;
      }
    }
    img {
      background-color: #3e5363;
      border-radius: 50%;
      width: 4rem;
    }
    align-items: center;
  }
  ul {
    list-style: none;
    margin-top: 3rem;
    border-top: 1px solid #3e5363;
    padding: 1rem 1rem;
    padding-top: 2rem;
    display: flex;
    transition: all 1s ease;
    justify-content: space-between;
  }
`;
const CaptionItems = styled.li`
  display: flex;
  align-items: center;
  width: 50%;
  div {
    display: flex;
    text-align: left;
    flex-direction: column;
    margin-left: 1.5rem;
  }
  button.active {
    opacity: 0.4;
    width: 65%;
  }
  img {
    width: 4rem;
    background: #3e5363;
    border-radius: 50%;
  }
  span {
    font-size: 1.5rem;
    font-weight: bold;
    color: #3e5363;
    margin: 10px 0;
    font-family: 'Roboto Condensed', sans-serif;
  }
`;
const Header = styled(H)`
  div {
    ul {
      @media (max-width: 600px) {
        background: #f5f6f7;
      }
      li {
        a {
          color: #3e5363;
          &:hover {
            border-color: #3e5363;
          }
        }
      }
    }
    border-bottom: 2px solid #3e5363;
  }
`;
const Footer = styled(F)`
  div {
    border-top: 2px solid #3e5363;
    span {
      color: #3e5363;
      * {
        color: #3e5363;
      }
    }
  }
`;
const GraphDivWithPagination = styled.div`
  margin-top: 3rem;
  display: flex;
  align-self: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  color: #3e5363;
  background: rgba(62, 83, 99, 0.06);
  h3 {
    padding: 1.5rem;
  }
  .main-chart-wrapper {
    width: 100%;
    div {
      & > * {
        font-size: 125%;
      }
      text {
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 290%;
        color: #fff;
        font-weight: bold;
        &.title {
          font-size: 120%;
        }
      }
    }
    padding-bottom: 1rem;
    border-bottom: 2px solid #3e5363;
  }
  margin-bottom: 3rem;
`;
const ActivityIndicatorPlaceholder = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20rem 0;
  span {
    margin-top: 3rem;
  }
  font-family: 'Roboto Condensed', sans-serif;
  color: ${(p: { fontColor?: string }) => (p.fontColor ? p.fontColor : '#FFF')};
  font-size: 3rem;
  align-items: center;
`;
const ModalDiv = styled.div`
  width: 100%;
  color: #3e5363;
  span {
    font-size: 3rem;
    display: flex;
    position: relative;
    justify-content: center;
    img {
      position: absolute;
      left: 120%;
      bottom: 0%;
    }
  }
  div {
    width: 80%;
    justify-content: space-between;
    margin-top: 3rem;
    display: flex;
  }
  align-items: center;
  justify-content: center;
  font-family: 'Roboto Condensed', sans-serif;
  display: flex;
  flex-direction: column;
`;
