import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import router from './router'

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { dom } from "@fortawesome/fontawesome-svg-core";

library.add(fas);
library.add(fab);
library.add(far);
dom.watch();

const store = createStore({
  state () {
    return {
      projectData: {},
      projectPath: "",
    }
  },
  mutations: {

    updateProjectData( state, projectData) {
      state.projectData = projectData
    },

    updateProjectPath( state, projectPath) {
      state.projectPath = projectPath
    }
  }
});

import Particles from 'particles.vue3'
import Toggle from '@vueform/toggle'
import Buffer from 'buffer'
import LvProgressBar from 'lightvue/progress-bar';

import '@vueform/toggle/themes/default.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import '@/assets/css/global.css'
import '@/assets/css/sidebar.css'
import '@/assets/css/workflow.css'
import '@/assets/css/animation.css'
import '@/assets/css/buttons.css'
import '@/assets/css/dropdown.css'
import '@/assets/css/cards.css'
import '@/assets/css/modal.css'

import JsonViewer from 'vue-json-viewer'
import Graph from "@/components/Graph.vue"
import HyperspectralGraph from "@/components/HyperspectralGraph.vue"
import HalfGraphLoader from "@/components/HalfGraphLoader.vue"
import QuarterGraph from "@/components/QuarterGraph.vue"
import QuarterGraphLoader from "@/components/QuarterGraphLoader.vue"

import SidebarMenuContainer from "@/components/SidebarMenuContainer.vue"
import MainMenuContainer from "@/components/MainMenuContainer.vue"

import Navbar from "@/components/Navbar.vue";
import MenuCard from "@/components/cards/MenuCard.vue"

import WorkflowContainer from "@/components/workflows/WorkflowContainer.vue"
import WorkflowRow from "@/components/workflows/WorkflowRow.vue"
import WorkflowCard from "@/components/workflows/WorkflowCard.vue"
import Modal from "@/components/Modal.vue"
import MetadataModal from "@/components/MetadataModal.vue"

// Sidebar components
import Sidebar from "@/components/sidebar/Sidebar.vue";
import MathText from "@/components/sidebar/MathText.vue"

import AnalysisButton from "@/components/sidebar/buttons/AnalysisButton.vue"
import ReturnButton from "@/components/sidebar/buttons/ReturnButton.vue"
import SaveResultsButton from "@/components/sidebar/buttons/SaveResultsButton.vue"
import UploadFileButton from "@/components/sidebar/buttons/UploadFileButton.vue"

import NumberField from "@/components/sidebar/inputs/NumberField.vue"
import VueNumberInput from '@chenfengyuan/vue-number-input'

import ProjectList from "@/components/sidebar/projects/ProjectList.vue";
import ListLoader from "@/components/sidebar/projects/ListLoader.vue"
import ProjectItem from "@/components/sidebar/projects/items/ProjectItem.vue"
import ProjectInProgressItem from "@/components/sidebar/projects/items/ProjectInProgressItem.vue"
import ProjectPreprocessingItem from "@/components/sidebar/projects/items/ProjectPreprocessingItem.vue"

var app = createApp( App );

console.log( app.version )

app.use( store )
app.use( router );
app.use( Particles );
app.use( Buffer );

app.component("font-awesome-icon", FontAwesomeIcon);
app.component("vue-toggle", Toggle);
app.component("LvProgressBar", LvProgressBar)

app.component("nav-bar", Navbar);
app.component("main-menu", MainMenuContainer);
app.component("menu-with-sidebar", SidebarMenuContainer);

app.component("menu-card", MenuCard);
app.component("workflow-container", WorkflowContainer);
app.component("workflow-row", WorkflowRow);
app.component("workflow-card", WorkflowCard);
app.component("modal", Modal);
app.component("metadata-modal", MetadataModal);

app.component("json-viewer", JsonViewer);
app.component("graph-area", Graph);
app.component("half-graph-area", HyperspectralGraph);
app.component("half-graph-loader", HalfGraphLoader);
app.component("quarter-graph-area", QuarterGraph);
app.component("quarter-graph-loader", QuarterGraphLoader);

app.component("vue-sidebar", Sidebar);
app.component("math-text", MathText);

app.component("analysis-button", AnalysisButton);
app.component("return-button", ReturnButton);
app.component("save-results-button", SaveResultsButton);
app.component("upload-file-button", UploadFileButton);

app.component("number-field", NumberField);
app.component("vue-number-input", VueNumberInput);


app.component("project-list", ProjectList);
app.component("list-loader", ListLoader);

app.component("project-item", ProjectItem);
app.component("project-in-progress", ProjectInProgressItem);
app.component("project-preprocessing", ProjectPreprocessingItem);

app.mount('#app');
