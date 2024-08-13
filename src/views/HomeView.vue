<template>
  <div class="px-6 mb-32">
    <!-- <Toolbar class="bg-white-gray-100 border-gray-300 dark:bg-gray-100 dark:border-gray-300">
      <template #start>

      </template>
      <template #end>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2 bg-green-700 border-green-700 px-10 py-0" @click="$router.push(`/new?${queryParams}`)" />
      </template>
    </Toolbar> -->
    <div class="w-full flex">
      <Button 
        type="button"
        icon="pi pi-filter" 
        :label="`Shipping Type: ${currentShippingType?.label}`" 
        @click="toggleType" 
        aria-haspopup="true" 
        aria-controls="type_menu" 
        class="mt-5 -mb-2 ml-auto" 
        plain 
        text 
        raised 
      />
      <Menu ref="typemenu" id="type_menu" :model="shippingTypes" :popup="true" />
      <Button 
        type="button"
        icon="pi pi-filter" 
        :label="`Month: ${currentBoard?.label}`" 
        @click="toggle" 
        aria-haspopup="true" 
        aria-controls="overlay_menu" 
        class="mt-5 -mb-2 ml-10" 
        plain 
        text 
        raised 
      />
      <Menu ref="menu" id="overlay_menu" :model="boardGroups" :popup="true" />
    </div>
    <div class="w-full flex items-center justify-between mt-10">
      <Button raised :disabled="!(searchGroupItems?.boards.length > 0)" @click.prevent="showAll" severity="danger">
        <div class="text-white font-semibold ">Show All</div>
      </Button>
      <div class="inline-flex items-center">
        <i class="pi pi-search" />
        <InputNumber v-model="searchTerm" placeholder="Search PO Number" :use-grouping="false" class="ml-4"/>
        <Button raised :disabled="!searchTerm" @click.prevent="searchItem" class="pr-8" color="bg-blue-600">
         <div class="text-white font-semibold ">Search</div>
        </Button>       
      </div>
    </div>
    <DataTable 
      ref="dt" 
      dataKey="id" 
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" 
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      class="mt-6"
      showGridlines 
      scrollable
      scroll-height="600px"
      :loading="itemsLoading || newItemsLoading"
      :value="items" 
      :rowsPerPageOptions="[10,25]"
    >
      <template #header>
          <div class="w-full flex flex-wrap gap-2 items-center justify-between">
            <h3 class="m-0 text-xl font-semibold">{{ currentBoard?.label }}</h3> 
          </div>
      </template>
      <Column field="name" header="PO Number" style="min-width: 9rem" frozen class="font-semibold"></Column>
      <Column :exportable="false" style="min-width: 6rem">
        <template #body="slotProps">
          <Button icon="pi pi-camera" outlined rounded class="" @click="addImagesToItem(slotProps.data)"></Button>
        </template>
      </Column>
      <Column header="Type" style="min-width: 12rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.type?.label" :style="{ background: slotProps.data.type.label_style.color }">
            <div class="text-center text-[0.95rem] px-4">
              {{ slotProps.data.type?.label }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="Files" style="min-width: 10rem;">
          <template #body="slotProps">
            <div class="flex items-center">
              <Image v-if="slotProps.data?.files?.[0]" :src="slotProps.data.files[0].public_url" loading="lazy" alt="thumb-1" title="thumb-1" class="shadow-2 border-round hover:cursor-pointer hover:shadow-xl transition-all w-8 " @click="selectCurrentItem(slotProps.data)" />
              <Image v-if="slotProps.data?.files?.[1]" :src="slotProps.data.files[1].public_url" loading="lazy" alt="thumb-2" title="thumb-2" class="shadow-2 border-round hover:cursor-pointer hover:shadow-xl transition-all w-8 ml-4" @click="selectCurrentItem(slotProps.data)" />
              <template v-if="slotProps.data?.files?.length > 2">
                <Tag class="bg-gray-500 rounded-full h-5 flex justify-center items-center ml-2 -mr-4 text-[0.85rem]">
                  + {{ slotProps.data?.files?.length - 2 }}
                </Tag>
              </template>
            </div>
              
          </template>
      </Column>
      <Column header="Status" style="min-width: 8rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.status?.label" :style="{ background: slotProps.data.status.label_style.color }">
            <div class="text-center text-[0.95rem] px-4">
              {{ slotProps.data.status?.label }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="CSR" style="min-width: 8rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.csr?.label" :style="{ background: slotProps.data.csr.label_style.color }">
            <div class="text-center text-[0.95rem] px-4">
              {{ slotProps.data.csr?.label }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="Ready Date" style="min-width:8rem">
          <template #body="slotProps">
            {{ parseDate(slotProps.data.readyDate.date) }}
          </template>
      </Column>
      <Column header="Shipping Date" style="min-width:8rem">
          <template #body="slotProps">
            {{ parseDate(slotProps.data.shippingDate.date) }}
          </template>
      </Column>
      
    </DataTable>


    <div class="w-full flex justify-center items-center mt-4">
      <ProgressSpinner v-show="itemsLoading || newItemsLoading || itemsTypeLoading"></ProgressSpinner>
    </div>
    <div class="w-full flex justify-center items-center mt-4">
      <Button text raised :disabled="!hasCursor" @click="loadMore()">
        <div class="text-blue-600 font-semibold">Load More (Cargar mas)</div>
      </Button>
    </div>
    <!-- <Dialog 
      v-model:visible="showImagesDialog" 
      modal 
      header="Files"
      :style="{ width: '50vw', maxHeight: '94vh' }" 
      :breakpoints="{ '960px': '75vw', '641px': '100vw' }"
    >
      <div class="w-full"> -->
        <Galleria v-if="currentItem && currentItem.files && currentItem.files.length" v-model:visible="showImagesDialog" :value="currentItem?.files || []" :responsiveOptions="galleryResponsiveOptions" :circular="true" class="px-6" containerClass="max-w-[75%] md:max-w-[89%] lg:max-w-[50%]" containerStyle="max-height: 98vh;" :showItemNavigators="true" :fullScreen="true">
          <template #item="slotProps">
            <img :src="slotProps.item.public_url" alt="product-img" title="product-img" style="display: block;" class="lg:max-h-[72vh] mb-10" />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.public_url" alt="product-thumb" title="product-thumb" style="display: block; max-height: 100px;" class="px-6" />
          </template>
        </Galleria>
      <!-- </div>
    </Dialog> -->
    <Dialog v-model:visible="addImagesDialog" :style="{ width: '75vw', maxHeight: '85vh' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" header="Add Images" modal>
      <label class="text-xl mb-4"><b>PO Number: </b>{{ itemToEdit.name }}</label><br><br>
      <label class="text-xl mb-4"><b>Type: </b>{{ itemToEdit.type.label }}</label>
      <div class="flex flex-wrap gap-4 mt-10">
        <template v-for="file in itemToEdit.files" :key="file.public_url">
            <img :src="file.public_url" alt="product-img" title="product-img" style="display: block;" class="lg:max-h-[200px] mb-10" />
        </template>
      </div>
      <Toast />
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
        <Button class="mt-8" :disabled="newFilesUploading" @click.prevent="uploadFiles()">Save</Button>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Image from 'primevue/image';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import Galleria from 'primevue/galleria';
import FileUpload from 'primevue/fileupload';
import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
import axios from 'axios';
import Badge from 'primevue/badge';
import { useAuth } from '@/composables/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const queryParams = computed(() => {
  return new URLSearchParams({
    groupId: currentBoard.value?.key || "",
  });
});

const hasCursor = computed(() => {
  return currentCursor.value;
})

const getKeyFromString = (data: any, key: string) => {
  if (data) {
    const keyValue = JSON.parse(data);
    return keyValue?.[key] || null;
  }
  return null;
}

const itemToEdit = ref();
const addImagesDialog = ref(false);

const addImagesToItem = (item: any) => {
  itemToEdit.value = item;
  console.log(itemToEdit.value);
  addImagesDialog.value = true;
}

const selectCurrentItem = (data: any) => {
  currentItem.value = data;
  showImagesDialog.value = true;
}

const page = ref(1);
const currentCursor = ref(null);
const showImagesDialog = ref(false);
const newItemsFetchEnabled = ref(false);
const searchItemsFetchEnabled = ref(false);
const initialLoadFetchEnabled = ref(false);
const searchTerm = ref();

const galleryResponsiveOptions = ref([
    {
        breakpoint: '991px',
        numVisible: 5
    },
    {
        breakpoint: '767px',
        numVisible: 4
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);

const parseDate = (dateString: string) => {
  if (dateString) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      // @ts-ignore
    }).format(new Date(dateString.split('-')))
  }
  return null;
}

const menu = ref();
const typemenu = ref();

const toggle = (event: any) => {
  menu.value.toggle(event);
};

const toggleType = (event: any) => {
  typemenu.value.toggle(event);
}

const dt = ref();

const { result: boardsGroups, load: loadBoardGroups, refetch: refetchBoardGroups } = useLazyQuery(gql`
  query getBoardGroups {
    boards(ids: 2940773675) {
      groups {
        id
        title
      }
    }
  }
`);

const boardGroups = computed(() => {
  return boardsGroups.value?.boards?.[0]?.groups?.map((group: any) => ({
    key: group.id,
    label: group.title,
    command: ({ item }: any) => {
      currentBoard.value = item;
      currentShippingType.value = {key: 'all', label: 'All'};
    }
  })) || [];
});

interface ShippingType {
  key?: string | number;
  label?: string;
}

const currentShippingType = ref<ShippingType>({ key: 'all', label: 'All'})

const shippingTypes = ref<any>([
  {key: 'all', label: 'All', command: ({ item }: any) => { currentShippingType.value = item }},
  {key: 0, label: 'Will Call', command: ({ item }: any) => { currentShippingType.value = item }},
  {key: 1, label: 'FedEx / UPS', command: ({ item }: any) => { currentShippingType.value = item }},
  {key: 2, label: 'LTL', command: ({ item }: any) => { currentShippingType.value = item }},
]);

watch(
  () => currentShippingType.value,
  async () => {
    try {
      shippingTypeFetchEnabled.value = true;
      if (currentShippingType.value && currentShippingType.value.key === 'all') {
        await refetch();
      } else {
        const id = [];
        page.value = 1;
        id.push(currentBoard.value.key || '');
        groupItemTypeVariables.value = {
          groupId: id,
          shippingType: [+(currentShippingType.value?.key || 0)]
        }
        await typeLoad(
          gql`
          query getGroupItems($groupId: [String], $shippingType: CompareValue!) {
            boards(ids: 2940773675) {
              name
              groups(ids: $groupId) {
                title
                items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }, rules: [{ column_id: "status6", compare_value: $shippingType, operator: any_of }], operator: and}) {
                  cursor
                  items {
                    id
                    name
                    assets {
                      url
                      url_thumbnail
                      public_url
                    }
                    column_values {
                      column {
                        id
                        title
                      }
                      type
                      value
                      ... on StatusValue {
                        label
                        label_style {
                          color
                        }
                        text
                        value
                      }
                      ... on DateValue {
                        date
                        text
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        `, {
          groupId: id,
          shippingType: [+(currentShippingType.value?.key || 0)],
        }, {
          enabled: shippingTypeFetchEnabled.value 
        });
      }
    } catch (e) { 
      console.error(e);
    } finally {
      shippingTypeFetchEnabled.value = false;
    }
  },
  { deep: true }
)

const itemsMapCB = (item: any) => ({
  id: item.id,
  name: item.name,
  files: item.assets,
  type: item.column_values.find((col: any) => col.column.title === 'Type'),
  status: item.column_values.find((col: any) => col.column.title === 'Status'),
  csr: item.column_values.find((col: any) => col.column.title === 'CSR'),
  readyDate: item.column_values.find((col: any) => col.column.title === 'Ready Date'),
  shippingDate: item.column_values.find((col: any) => col.column.title === 'Shipping Date'),
})

const items = computed(() => {
  return [...currentItems.value.map(itemsMapCB) || []];
});

interface BoardGroup {
  title?: string;
  id?: string;
  key?: string;
  label?: string;
}

const currentBoard = ref<BoardGroup>({});
const currentItem = ref<any>();

watch(
  () => boardsGroups.value,
  () => {
    currentBoard.value = boardsGroups.value?.boards?.[0]?.groups?.map((group: any) => ({
      key: group.id,
      label: group.title,
    }))?.[0] || {};
  },
);

const currentItems = ref<any[]>([]);

const { result: groupItems, variables: groupItemVariables, loading: itemsLoading, load, refetch } = useLazyQuery(gql`
  query getGroupItems($groupId: [String]) {
    boards(ids: 2940773675) {
      name
      groups(ids: $groupId) {
        title
        items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }}) {
          cursor
          items {
            id
            name
            assets {
              url
              url_thumbnail
              public_url
            }
            column_values {
              column {
                id
                title
              }
              type
              value
              ... on StatusValue {
                label
                label_style {
                  color
                }
                text
                value
              }
              ... on DateValue {
                date
                text
                value
              }
            }
          }
        }
      }
    }
  }
`, {
  groupId: [''],
}, {
  enabled: initialLoadFetchEnabled.value 
});

const shippingTypeFetchEnabled = ref(false);

const { result: groupItemsType, variables: groupItemTypeVariables, loading: itemsTypeLoading, load: typeLoad, refetch: typeRefetch } = useLazyQuery(gql`
  query getGroupItems($groupId: [String], $shippingType: CompareValue!) {
    boards(ids: 2940773675) {
      name
      groups(ids: $groupId) {
        title
        items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }, rules: [{ column_id: "status6", compare_value: $shippingType, operator: any_of }], operator: and}) {
          cursor
          items {
            id
            name
            assets {
              url
              url_thumbnail
              public_url
            }
            column_values {
              column {
                id
                title
              }
              type
              value
              ... on StatusValue {
                label
                label_style {
                  color
                }
                text
                value
              }
              ... on DateValue {
                date
                text
                value
              }
            }
          }
        }
      }
    }
  }
`, {
  groupId: [''],
  shippingType: [0],
}, {
  enabled: shippingTypeFetchEnabled.value 
});

watch(
  () => groupItemsType.value,
  () => {
    currentCursor.value = groupItemsType.value?.boards?.[0]?.groups?.[0]?.items_page?.cursor
    currentItems.value = groupItemsType.value?.boards?.[0]?.groups?.[0]?.items_page?.items || [];
  },
  { deep: true }
)

watch(
  () => groupItems.value,
  () => {
    currentCursor.value = groupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.cursor
    currentItems.value = groupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.items || [];
  },
  { deep: true }
)

const {
  checkToken,
} = useAuth();

onMounted(async () => {
  try {
    // @ts-ignore
    const result = await checkToken();
    if (result === 'redirect') {
      router.push('/login')
    } else {
      fileupload.value?.focus();
      await loadBoardGroups();
    }
  } catch (e) {
    console.error(e);
  } 
})

const { result: searchGroupItems, variables: searchGroupItemVariables, loading: searchItemsLoading, load: searchLoad, refetch: searchRefetch } = useLazyQuery(gql`
  query searchItems($searchGroupId: [String], $searchItemName: CompareValue!) {
    boards(ids: 2940773675) {
      name
      groups(ids: $searchGroupId) {
        title
        items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }, rules: [{ column_id: "name", compare_value: $searchItemName, operator: any_of }]}) {
          cursor
          items {
            id
            name
            assets {
              url
              url_thumbnail
              public_url
            }
            column_values {
              column {
                id
                title
              }
              type
              value
              ... on StatusValue {
                label
                label_style {
                  color
                }
                text
                value
              }
              ... on DateValue {
                date
                text
                value
              }
            }
          }
        }
      }
    }
  }
`, {
  searchGroupId: [''],
  searchItemName: [""]
}, {
  enabled: searchItemsFetchEnabled.value 
});

const searchItem = async () => {
  searchItemsFetchEnabled.value = true;
  const id = [];
  id.push(currentBoard.value.key || '');
  const search = [];
  search.push(searchTerm.value + "" || '');
  searchGroupItemVariables.value = {
    searchGroupId: id,
    searchItemName: search
  }
  const result = await searchLoad(
    gql`
    query searchItems($searchGroupId: [String], $searchItemName: CompareValue!) {
      boards(ids: 2940773675) {
        name
        groups(ids: $searchGroupId) {
          title
          items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }, rules: [{ column_id: "name", compare_value: $searchItemName, operator: any_of }]}) {
            cursor
            items {
              id
              name
              assets {
                url
                url_thumbnail
                public_url
              }
              column_values {
                column {
                  id
                  title
                }
                type
                value
                ... on StatusValue {
                  label
                  label_style {
                    color
                  }
                  text
                  value
                }
                ... on DateValue {
                  date
                  text
                  value
                }
              }
            }
          }
        }
      }
    }
  `, {
    searchGroupId: id,
    searchItemName: search,
  }, {
    enabled: searchItemsFetchEnabled.value 
  });
  
  currentItems.value = searchGroupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.items || [];
  currentCursor.value = searchGroupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.cursor || null;
  searchItemsFetchEnabled.value = false;
}

watch(
  () => searchGroupItems.value,
  () => {
    currentItems.value = searchGroupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.items || [];
    currentCursor.value = searchGroupItems.value?.boards?.[0]?.groups?.[0]?.items_page?.cursor || null;
  },
  { deep: true }
)



const { load: paginationLoad, refetch: paginationRefetch, result: newGroupItems, variables: newItemsVariables, loading: newItemsLoading } = useLazyQuery(gql`
  query getNextItems($cursor: String!) {
      next_items_page (limit: 100, cursor: $cursor) {
        cursor
        items {
          id
          name
          assets {
            url
            url_thumbnail
            public_url
          }
          column_values {
            column {
              id
              title
            }
            type
            value
            ... on StatusValue {
              label
              label_style {
                color
              }
              text
              value
            }
            ... on DateValue {
              date
              text
              value
            }
          }
        }
      }
    }
`, {
  cursor: currentCursor.value
}, { 
  enabled: newItemsFetchEnabled.value 
});

const loadMore = async () => {
  newItemsFetchEnabled.value = true;
  const result = await paginationLoad(
  gql`
  query getNextItems($cursor: String!) {
      next_items_page (limit: 100, cursor: $cursor) {
        cursor
        items {
          id
          name
          assets {
            url
            url_thumbnail
            public_url
          }
          column_values {
            column {
              id
              title
            }
            type
            value
            ... on StatusValue {
              label
              label_style {
                color
              }
              text
              value
            }
            ... on DateValue {
              date
              text
              value
            }
          }
        }
      }
    }
  `, {
    cursor: currentCursor.value
  }, { 
    enabled: newItemsFetchEnabled.value 
  });
  newItemsVariables.value = {
    cursor: currentCursor.value
  }
}

watch(
  () => newItemsLoading.value,
  () => {
    itemsLoading.value = newItemsLoading.value;
  },
)

watch(
  () => newGroupItems.value,
  () => {
    currentCursor.value = newGroupItems.value?.next_items_page?.cursor;
    currentItems.value = [
      ...currentItems.value,
      ...newGroupItems.value?.next_items_page?.items || []
    ]
  },
  { deep: true }
)

const initialLoad = async() => {
  initialLoadFetchEnabled.value = true;
  const id = [];
  page.value = 1;
  id.push(currentBoard.value.key || '');
  groupItemVariables.value = {
    groupId: id,
  }
  await load(
    gql`
    query getGroupItems($groupId: [String]) {
      boards(ids: 2940773675) {
        name
        groups(ids: $groupId) {
          title
          items_page (limit: 100, query_params: { order_by: { column_id: "__creation_log__", direction: desc }}) {
            cursor
            items {
              id
              name
              assets {
                url
                url_thumbnail
                public_url
              }
              column_values {
                column {
                  id
                  title
                }
                type
                value
                ... on StatusValue {
                  label
                  label_style {
                    color
                  }
                  text
                  value
                }
                ... on DateValue {
                  date
                  text
                  value
                }
              }
            }
          }
        }
      }
    }
  `, {
    groupId: id,
  }, {
    enabled: initialLoadFetchEnabled.value 
  });
  initialLoadFetchEnabled.value = false;
}

watch(
  () => currentBoard.value,
  async () => {
    if (!searchItemsFetchEnabled.value) {
      if (currentBoard.value && currentBoard.value.key) {
        await initialLoad();
      }
    } 
  }
);

const showAllClicked = ref(false);

const showAll = () => {
  showAllClicked.value = !showAllClicked.value;
}

watch(
  () => showAllClicked.value,
  async () => {
    if (!searchItemsFetchEnabled.value) {
      if (currentBoard.value && currentBoard.value.key) {
        initialLoadFetchEnabled.value = true;
        const id = [];
        page.value = 1;
        id.push(currentBoard.value.key || '');
        groupItemVariables.value = {
          groupId: id,
        }
        await refetch({ groupId: id });
        initialLoadFetchEnabled.value = false;
        searchTerm.value = null;
      }
    }
  }
)

const toast = useToast();
const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);
const newFilesUploading = ref(false);
const fileupload = ref<any>(null);

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

const onSelectedFiles = (event: any) => {
    files.value = event.files;
    files.value.forEach((file: File) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: any) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};

const uploadFile = async ()  => {
  const promises: any = [];
  files.value.forEach(async (file) => {
    const formData = new FormData();
    formData.append('map', JSON.stringify({ "image": "variables.file" }));
    formData.append('variables', JSON.stringify({ "itemId": +itemToEdit.value.id }));
    formData.append('file', file);
    const result = axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_URL}/api/upload-file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
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


const uploadFiles = async () => {
  try {
    newFilesUploading.value = true;
    await uploadFile();
    initialLoadFetchEnabled.value = true;
    const id = [];
    page.value = 1;
    id.push(currentBoard.value.key || '');
    groupItemVariables.value = {
      groupId: id,
    }
    await refetch({ groupId: id });
    initialLoadFetchEnabled.value = false;
    searchTerm.value = null;
    const currentItemFound = items.value.find((item: any) => item.id === itemToEdit.value.id);
    files.value = [];
    fileupload.value.clear();
    fileupload.value.uploadedFileCount = 0;
    if (currentItemFound && currentItemFound.id) {
      itemToEdit.value = currentItemFound;
    }
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Error", detail: "Error uploading files", life: 3000 });
  } finally {
    newFilesUploading.value = false;
  } 
}
</script>

<style scoped>
::v-deep table > thead th > div[data-pc-section="headercontent"] > span[data-pc-section="headertitle"] {
  font-weight: 800 !important;
  font-size: 0.95rem;
}

.gallery-container {
  max-width: 50% !important;
}
</style>