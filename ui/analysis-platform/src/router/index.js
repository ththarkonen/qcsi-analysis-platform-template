import { createWebHistory, createRouter } from "vue-router";
import MainMenu from "@/views/MainMenu.vue";

import CarsMenu from "@/views/cars/CarsMenu.vue";
import QuantumMenu from "@/views/quantum/QuantumMenu.vue"
import RamanMenu from "@/views/raman/RamanMenu.vue";

import CarsSpectrumMenu from "@/views/cars/spectrum/CarsSpectrumMenu.vue";
import CarsHyperspectralMenu from "@/views/cars/hyperspectral/CarsHyperspectralMenu.vue";

import BackgroundCorrectionCars from "@/views/cars/spectrum/backgroundCorrection/BackgroundCorrectionCars.vue";
import LineNarrowingBackgroundCorrectionCars from "@/views/cars/spectrum/lineNarrowing/LineNarrowingBackgroundCorrectionCars.vue"
import LineNarrowingCars from "@/views/cars/spectrum/lineNarrowing/LineNarrowingCars.vue"

import BackgroundCorrectionCarsHyperspectral from "@/views/cars/hyperspectral/backgroundCorrection/BackgroundCorrectionHyperspectralCars.vue";
import FrameExplorerCarsHyperspectral from "@/views/cars/hyperspectral/frameExplorer/FrameExplorerHyperspectralCars.vue";

import BackgroundCorrectionUnivariateCarsHyperspectral from "@/views/cars/hyperspectral/univariateAnalysis/BackgroundCorrectionHyperspectralCars.vue";
import UnivariateAnalysisHyperspectralCars from "@/views/cars/hyperspectral/univariateAnalysis/UnivariateAnalysisHyperspectralCars.vue";

import BackgroundCorrectionPcaCarsHyperspectral from "@/views/cars/hyperspectral/pca/BackgroundCorrectionHyperspectralCars.vue";
import PcaHyperspectralCars from "@/views/cars/hyperspectral/pca/PcaHyperspectralCars.vue";

import CarsPcaHyperspectralCars from "@/views/cars/hyperspectral/cars-pca/PcaHyperspectralCars.vue";

import CarsSpectrumResultExplorer from "@/views/cars/spectrum/CarsResultExplorer.vue";

import RamanSpectrumMenu from "@/views/raman/spectrum/RamanSpectrumMenu.vue";

import BackgroundCorrectionRaman from "@/views/raman/spectrum/BackgroundCorrectionRaman.vue";

import QuantumResonators from "@/views/quantum/resonators/QuantumResonatorsMenu.vue";

import LorentzBackgroundPriorQR from "@/views/quantum/resonators/lorentz/LorentzBackgroundPriorQR.vue";
import LorentzPriorQR from "@/views/quantum/resonators/lorentz/LorentzPriorQR.vue";
import LorentzResonatorsQR from "@/views/quantum/resonators/lorentz/LorentzResonatorsQR.vue";

import FanoBackgroundPriorQR from "@/views/quantum/resonators/fano/FanoBackgroundPriorQR.vue";
import FanoPriorQR from "@/views/quantum/resonators/fano/FanoPriorQR.vue";
import FanoResonatorsQR from "@/views/quantum/resonators/fano/FanoResonatorsQR.vue";

import QuantumResonatorsResultExplorer from "@/views/quantum/resonators/QuantumResonatorsResultExplorer.vue";

const homeRoutes = [
  {
    path: "/",
    name: "MainMenu",
    component: MainMenu,
  },
];

const carsRoutes = [
  {
    path: "/cars",
    name: "CarsMenu",
    component: CarsMenu,
  },
  {
    path: "/cars/spectrum",
    name: "CarsSpectrumMenu",
    component: CarsSpectrumMenu,
  },
  {
    path: '/cars/spectrum/backgroundCorrection',
    name: "BackgroundCorrectionCars",
    component: BackgroundCorrectionCars,
    props: true,
  },
  {
    path: '/cars/spectrum/lineNarrowing/backgroundCorrection',
    name: "LineNarrowingBackgroundCorrectionCars",
    component: LineNarrowingBackgroundCorrectionCars,
    props: true,
  },
  {
    path: '/cars/spectrum/lineNarrowing/lineNarrowing',
    name: "LineNarrowingCars",
    component: LineNarrowingCars,
    props: true,
  },
  {
    path: '/cars/spectrum/resultExplorer',
    name: "CarsSpectrumResultExplorer",
    component: CarsSpectrumResultExplorer,
    props: true,
  },
  {
    path: "/cars/hyperspectral",
    name: "CarsHyperspectralMenu",
    component: CarsHyperspectralMenu,
  },
  {
    path: '/cars/hyperspectral/backgroundCorrection',
    name: "BackgroundCorrectionCarsHyperspectral",
    component: BackgroundCorrectionCarsHyperspectral,
    props: true,
  },
  {
    path: '/cars/hyperspectral/frameExplorer',
    name: "FrameExplorerCarsHyperspectral",
    component: FrameExplorerCarsHyperspectral,
    props: true,
  },
  {
    path: '/cars/hyperspectral/frameExplorer',
    name: "FrameExplorerCarsHyperspectral",
    component: FrameExplorerCarsHyperspectral,
    props: true,
  },
  {
    path: '/cars/hyperspectral/univariate/backgroundCorrection',
    name: "BackgroundCorrectionUnivariateCarsHyperspectral",
    component: BackgroundCorrectionUnivariateCarsHyperspectral,
    props: true,
  },
  {
    path: '/cars/hyperspectral/univariate/analysis',
    name: "UnivariateAnalysisHyperspectralCars",
    component: UnivariateAnalysisHyperspectralCars,
    props: true,
  },
  {
    path: '/cars/hyperspectral/raman-pca/backgroundCorrection',
    name: "BackgroundCorrectionPcaCarsHyperspectral",
    component: BackgroundCorrectionPcaCarsHyperspectral,
    props: true,
  },
  {
    path: '/cars/hyperspectral/raman-pca/analysis',
    name: "PcaHyperspectralCars",
    component: PcaHyperspectralCars,
    props: true,
  },
  {
    path: '/cars/hyperspectral/cars-pca/analysis',
    name: "CarsPcaHyperspectralCars",
    component: CarsPcaHyperspectralCars,
    props: true,
  },
];

const ramanRoutes = [
  {
    path: "/raman",
    name: "RamanMenu",
    component: RamanMenu,
  },
  {
    path: "/raman/spectrum",
    name: "RamanSpectrumMenu",
    component: RamanSpectrumMenu,
  },
  {
    path: '/raman/spectrum/backgroundCorrection',
    name: "BackgroundCorrectionRaman",
    component: BackgroundCorrectionRaman,
    props: true,
  },
];

const quantumRoutes = [
  {
    path: "/quantum",
    name: "QuantumMenu",
    component: QuantumMenu,
  },
  {
    path: "/quantum/resonators",
    name: "QuantumResonators",
    component: QuantumResonators,
  },
  {
    path: '/quantum/resonators/resultExplorer',
    name: "QuantumResonatorsResultExplorer",
    component: QuantumResonatorsResultExplorer,
    props: true,
  },
  {
    path: '/quantum/resonators/lorentz/backgroundPrior',
    name: "LorentzBackgroundPriorQR",
    component: LorentzBackgroundPriorQR,
    props: true,
  },
  {
    path: '/quantum/resonators/lorentz/lineshapePrior',
    name: "LorentzPriorQR",
    component: LorentzPriorQR,
    props: true,
  },
  {
    path: '/quantum/resonators/lorentz/smc',
    name: "LorentzResonatorsQR",
    component: LorentzResonatorsQR,
    props: true,
  },
  {
    path: '/quantum/resonators/fano/backgroundPrior',
    name: "FanoBackgroundPriorQR",
    component: FanoBackgroundPriorQR,
    props: true,
  },
  {
    path: '/quantum/resonators/fano/lineshapePrior',
    name: "FanoPriorQR",
    component: FanoPriorQR,
    props: true,
  },
  {
    path: '/quantum/resonators/fano/smc',
    name: "FanoResonatorsQR",
    component: FanoResonatorsQR,
    props: true,
  },
];

const routes = homeRoutes.concat( carsRoutes, ramanRoutes, quantumRoutes);

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
