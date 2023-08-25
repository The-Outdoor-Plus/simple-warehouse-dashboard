<template>
  <div class="px-6 mb-32">
    <div class="w-full">
      <label for="ponumber" class="font-bold block mb-2"> PO Number: </label>
      <InputNumber v-model="poNumber" inputId="ponumber" input-class="w-full" :useGrouping="false" class="w-full"/>
    </div>
    <div class="w-full mt-6">
      <label for="type" class="font-bold block mb-2"> Type: </label>
      <Dropdown v-model="selectedTypeLabel" :options="typeOptions" optionLabel="name" placeholder="Type" class="!w-full" input-class="w-full" />
    </div>
    <div class="w-full flex flex-col md:flex-row mt-6">
      <div class="w-full md:w-1/2 pr-6">
        <label for="" class="font-bold block mb-2 w-full"> Ready Date: </label>
        <Calendar v-model="readyDate" showIcon class="w-full" input-class="w-full" />
      </div>
      <div class="w-full md:w-1/2 pl-6">
        <label for="" class="font-bold block mb-2"> Shipping Date: </label>
        <Calendar v-model="shippingDate" showIcon class="w-full"  input-class="w-full"/>
      </div>
    </div>
    <div class="w-full mt-6">
      <Toast />
        <FileUpload name="demo[]" url="./upload.php" @upload="onTemplatedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="300000000" @select="onSelectedFiles">
            <template #header="{ chooseCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined></Button>
                        <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                    <ProgressBar :value="totalSizePercent" :showValue="false" :class="['md:w-20rem h-1rem w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]"
                        ><span class="white-space-nowrap">{{ totalSize }}B / 1Mb</span></ProgressBar
                    >
                </div>
            </template>
            <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                <div v-if="files.length > 0">
                    <h5>Pending</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div>
                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" class="shadow-2" />
                            </div>
                            <span class="font-semibold">{{ file.name }}</span>
                            <div>{{ formatSize(file.size) }}</div>
                            <Badge value="Pending" severity="warning" />
                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                        </div>
                    </div>
                </div>

                <div v-if="uploadedFiles.length > 0">
                    <h5>Completed</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div>
                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" class="shadow-2" />
                            </div>
                            <span class="font-semibold">{{ file.name }}</span>
                            <div>{{ formatSize(file.size) }}</div>
                            <Badge value="Completed" class="mt-3" severity="success" />
                            <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded  severity="danger" />
                        </div>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="flex align-items-center justify-content-center flex-column">
                    <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                    <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                </div>
            </template>
        </FileUpload>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import ProgressBar from 'primevue/progressbar';

const poNumber = ref();
const selectedTypeLabel = ref();

const typeOptions = ref([
  { name: 'FedEx / UPS', label: 'FedEx / UPS' },
  { name: 'LTL', label: 'LTL' },
  { name: 'Will Call', label: 'Will Call' },
  { name: '-', label: null },
]);

const readyDate = ref<any>(new Date());
const shippingDate = ref();


const toast = useToast();

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: any) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};

const onClearTemplatingUpload = (clear: Function) => {
    clear();
    totalSize.value = 0;
    totalSizePercent.value = 0;
};

const onSelectedFiles = (event: any) => {
    files.value = event.files;
    files.value.forEach((file: File) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const uploadEvent = (callback: Function) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
};

const onTemplatedUpload = () => {
    toast.add({ severity: "info", summary: "Success", detail: "File Uploaded", life: 3000 });
};

const formatSize = (bytes: any) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>