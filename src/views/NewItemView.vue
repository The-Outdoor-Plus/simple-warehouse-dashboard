<template>
  <div class="px-6 mb-32">
    <div class="w-full flex justify-end">
      <Button icon="pi pi-times" severity="contrast" rounded outlined aria-label="Cancel" @click.prevent="router.push('/')" />
    </div>
    <div class="w-full">
      <label for="ponumber" class="font-bold block mb-2"> PO Number: </label>
      <InputText v-model="poNumber" inputId="ponumber" input-class="w-full" :useGrouping="false" class="w-full"/>
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
        <FileUpload ref="fileupload" name="demo[]" url="./upload.php" @upload="onTemplatedUpload()" :multiple="true" accept="image/*" :maxFileSize="300000000" @select="onSelectedFiles">
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
        <div class="w-full flex justify-center items-center mt-4">
          <ProgressSpinner v-show="newFilesUploading"></ProgressSpinner>
        </div>
        <Button class="mt-8" :disabled="!poNumber || newFilesUploading" @click.prevent="createItem()">Create Item</Button>
    </div>
    <Toast />
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from "primevue/usetoast";
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Toast from 'primevue/toast';
import { useUserStore } from '@/store/user';
import ProgressSpinner from 'primevue/progressspinner';

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

const userStore = useUserStore();
const router = useRouter();

const toast = useToast();
const newFilesUploading = ref(false);

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);
const groupId = ref();
const itemId = ref();
const fileToUpload = ref();
const fileupload = ref<any>(null);

onMounted(() => {
  groupId.value = route.query?.groupId || '';
});

const columnValues = computed(() => {
  const rdyDate = `${readyDate.value.getFullYear()}-${("0" + (readyDate.value.getMonth() + 1)).slice(-2)}-${("0" + (readyDate.value.getDate())).slice(-2)}`;
  const shppngDate = shippingDate.value ? `${shippingDate.value.getFullYear()}-${("0" + (shippingDate.value.getMonth() + 1)).slice(-2)}-${("0" + (shippingDate.value.getDate())).slice(-2)}` : '';
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

onCreateItemDone(async (result) => {
  console.log('Item Created', result.data);
  itemId.value = result.data.create_item.id;
  toast.add({ severity: "success", summary: "Success", detail: "Item Created Successfully", life: 3000 });
  await uploadFiles();
  router.replace('/');
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
  const promises: any = [];
  files.value.forEach(async (file) => {
    const formData = new FormData();
    formData.append('map', JSON.stringify({ "image": "variables.file" }));
    formData.append('variables', JSON.stringify({ "itemId": +itemId.value }));
    formData.append('file', file);
    const result = axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_URL}/api/upload-file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data", "Authorization": userStore.currentToken },
    });
    promises.push(result);
  });
  try {
    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value?.status === 200) {
          toast.add({ severity: "success", summary: "Success", detail: "Files Uploaded", life: 3000 });
        } else {
          toast.add({ severity: "error", summary: "Error", detail: "Error uploading files", life: 3000 });
        }
      } else {
        toast.add({ severity: "error", summary: "Error", detail: "Error uploading files", life: 3000 });
      }
    });
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Error", detail: "Error uploading files", life: 3000 });
  }
}

const { mutate: updateItemUploadedBy } = useMutation(gql`
  mutation updateItemUploadedBy ($boardId: ID!, $itemId: ID, $columnId: String!, $value: String) {
    change_simple_column_value (board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
      id
    }
  }
`, {
  fetchPolicy: 'no-cache',
})

const uploadFiles = async () => {
  try {
    newFilesUploading.value = true;
    await uploadFile();
    try {
      await updateItemUploadedBy({
        boardId: 2940773675,
        itemId: itemId.value,
        columnId: 'text__1',
        value: userStore.currentUserName
      });
    } catch (e) {
      console.error(e);
      toast.add({ severity: "warn", summary: "Warning", detail: "User couldn't be updated", life: 3000 });
    }
    
    files.value = [];
    fileupload.value.clear();
    fileupload.value.uploadedFileCount = 0;
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Error", detail: "Error uploading files", life: 3000 });
  } finally {
    newFilesUploading.value = false;
  } 
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