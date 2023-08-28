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
        <FileUpload name="demo[]" url="./upload.php" @upload="onTemplatedUpload()" :multiple="true" accept="image/*" :maxFileSize="300000000" @select="onSelectedFiles">
            <template #header="{ chooseCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-camera" rounded outlined></Button>
                        <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                </div>
            </template>
            <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                <div v-if="files.length > 0">
                    <h5>Pending</h5>
                    <div class="sm:p-5">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="w-full m-0 px-6 flex border-1 items-center gap-3 mb-4">
                            <div>
                                <img role="presentation" :alt="file.name" :src="(file as any).objectURL" width="100" height="50" class="shadow-2" />
                            </div>
                            <span class="font-semibold flex-grow">{{ file.name }}</span>
                            <div>{{ formatSize(file.size) }}</div>
                            <!-- <Badge value="Pending" severity="warning" /> -->
                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                        </div>
                    </div>
                </div>

                <div v-if="uploadedFiles.length > 0">
                    <h5>Completed</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div>
                                <img role="presentation" :alt="file.name" :src="(file as any).objectURL" width="100" height="50" class="shadow-2" />
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
                <div class="flex items-center justify-center flex-col">
                    <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                    <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                </div>
            </template>
        </FileUpload>
        <Button class="mt-8" :disabled="!poNumber" @click.prevent="createItem()">Create Item</Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from "primevue/usetoast";
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useRoute } from 'vue-router';
import { create } from 'domain';
import { defaultDataIdFromObject } from '@apollo/client';

const route = useRoute();

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
const groupId = ref();
const itemId = ref();
const fileToUpload = ref();

onMounted(() => {
  groupId.value = route.query?.groupId || '';
});

const columnValues = computed(() => {
  const rdyDate = `${readyDate.value.getFullYear()}-${("0" + (readyDate.value.getMonth() + 1)).slice(-2)}-${readyDate.value.getDate()}`;
  const shppngDate = shippingDate.value ? `${shippingDate.value.getFullYear()}-${("0" + (shippingDate.value.getMonth() + 1)).slice(-2)}-${shippingDate.value.getDate()}` : '';
  const columns = {
    "status6": {
      "label": selectedTypeLabel.value?.label || '',
    },
    "date8": {
      "date": rdyDate,
    },
    "date28": {
      "date": shppngDate,
    },
    "date": rdyDate,
  }

  return JSON.stringify(columns);
});

const { mutate: createItem, onDone: onCreateItemDone } = useMutation(gql`
  mutation createItem ($groupId: String!, $itemName: String!, $columnValues: JSON!) {
	  create_item (board_id: 2940773675, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
		  id
	  }
  } 
`, () => ({
  variables: {
    groupId: groupId.value,
    itemName: `${poNumber.value}`,
    columnValues: columnValues.value,
  },
}));

onCreateItemDone((result) => {
  console.log('Item Created', result.data);
  itemId.value = result.data.create_item.id;
  uploadFiles();
});

// const { mutate: uploadFile, onDone: onUploadFileDone } = useMutation(gql`
//   mutation uploadFile ($file: File!, $itemId: String!) {
//     add_file_to_column(item_id: $itemId, column_id: "files" file: $file) {
//      id
//     }
//   }
// `, () => ({
//   variables: {
//     file: fileToUpload.value,
//     itemId: itemId.value,
//   },
//   clientId: 'mondayFileClient',
// }));

const uploadFile = async ()  => {
  files.value.forEach(async (file) => {
    const data = new FormData();
    data.append('query', 'mutation add_file($file: File!) {add_file_to_column (item_id: $itemid, column_id:"files" file: $file) {id}}');
    data.append('variables', JSON.stringify({ "itemid": itemId.value }));
    data.append('map', JSON.stringify({ "image": "variables.file" }));
    data.append('image', file);
    const result = await fetch(`${import.meta.env.VITE_MONDAY_API_URL}/file` || 'https://api.monday.com/v2/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization : import.meta.env.VITE_MONDAY_TOKEN,
        'API-Version' : '2023-04'
      },
      body: data,
    });

    if (result.status !== 200) {
      throw new Error('Error uploading file');
    }

    const response = await result.json();
    console.log(response);
  });
}

const uploadFiles = async () => {
  await uploadFile();
}

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