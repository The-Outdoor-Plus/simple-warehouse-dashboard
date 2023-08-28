<template>
  <div class="px-6 mb-32">
    <Toolbar class="bg-white-gray-100 border-gray-300 dark:bg-gray-100 dark:border-gray-300">
      <template #start>

      </template>
      <template #end>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2 bg-green-700 border-green-700 px-10 py-0" @click="$router.push(`/new?${queryParams}`)" />
      </template>
    </Toolbar>
    <div class="w-full flex">
      <Button 
        type="button"
        icon="pi pi-filter" 
        :label="currentBoard?.label" 
        @click="toggle" 
        aria-haspopup="true" 
        aria-controls="overlay_menu" 
        class="mt-5 -mb-2 ml-auto" 
        plain 
        text 
        raised 
      />
      <Menu ref="menu" id="overlay_menu" :model="boardGroups" :popup="true" />
    </div>
    <DataTable 
      ref="dt" 
      dataKey="id" 
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" 
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      class="mt-6"
      showGridlines 
      scrollable
      :loading="itemsLoading"
      :value="items" 
      :rowsPerPageOptions="[10,25]"
    >
      <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
              <h3 class="m-0 text-xl font-semibold">{{ currentBoard?.label }}</h3>
          </div>
      </template>
      <Column field="name" header="PO Number" style="min-width: 9rem" frozen class="font-semibold"></Column>
      <Column header="Type" style="min-width: 12rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.type.additional_info" :style="{ background: getKeyFromString(slotProps.data.type.additional_info, 'color') }">
            <div class="text-center text-[0.95rem] px-4">
              {{ getKeyFromString(slotProps.data.type.additional_info, 'label') }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="Files" style="min-width: 10rem;">
          <template #body="slotProps">
            <div class="flex items-center">
              <img v-if="slotProps.data?.files?.[0]" :src="slotProps.data.files[0].url_thumbnail" alt="thumb-1" title="thumb-1" class="shadow-2 border-round hover:cursor-pointer hover:shadow-xl transition-all w-8 " @click="selectCurrentItem(slotProps.data)" />
              <img v-if="slotProps.data?.files?.[1]" :src="slotProps.data.files[1].url_thumbnail" alt="thumb-2" title="thumb-2" class="shadow-2 border-round hover:cursor-pointer hover:shadow-xl transition-all w-8 ml-4" @click="selectCurrentItem(slotProps.data)" />
              <template v-if="slotProps.data?.files?.length > 2">
                <Tag class="bg-gray-500 rounded-full h-5 flex justify-center items-center ml-2 -mr-4 text-[0.85rem]">
                  + {{ slotProps.data?.files?.length - 2 }}
                </Tag>
              </template>
            </div>
              
          </template>
      </Column>
      <Column header="Status" style="min-width: 12rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.status.additional_info" :style="{ background: getKeyFromString(slotProps.data.status.additional_info, 'color') }">
            <div class="text-center text-[0.95rem] px-4">
              {{ getKeyFromString(slotProps.data.status.additional_info, 'label') }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="CSR" style="min-width: 12rem" class="text-center font-semibold">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.csr.additional_info" :style="{ background: getKeyFromString(slotProps.data.csr.additional_info, 'color') }">
            <div class="text-center text-[0.95rem] px-4">
              {{ getKeyFromString(slotProps.data.csr.additional_info, 'label') }}
            </div>
          </Tag>
        </template>
      </Column>
      <Column header="Ready Date" style="min-width:12rem">
          <template #body="slotProps">
            {{ parseDate(getKeyFromString(slotProps.data.readyDate.value, 'date')) }}
          </template>
      </Column>
      <Column header="Shipping Date" style="min-width:12rem">
          <template #body="slotProps">
            {{ parseDate(getKeyFromString(slotProps.data.shippingDate.value, 'date')) }}
          </template>
      </Column>
    </DataTable>
    <div class="w-full flex justify-center items-center mt-4">
      <Button text raised :disabled="page <= 1" @click="page = (page > 1) ? page - 1 : page">
        <i class="pi pi-angle-double-left text-blue-600 mr-2"></i>
        <div class="text-blue-600 font-semibold">Prev</div>
      </Button>
      <div class="font-bold mx-6">Page: {{ page }}</div>
      <Button text raised :disabled="items.length < 10" @click="page = page + 1">
        <div class="text-blue-600 font-semibold">Next</div>
        <i class="pi pi-angle-double-right text-blue-600 ml-2"></i>
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
            <img :src="slotProps.item.url" alt="product-img" title="product-img" style="display: block;" class="lg:max-h-[72vh] mb-10" />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.url" alt="product-thumb" title="product-thumb" style="display: block; max-height: 100px;" class="px-6" />
          </template>
        </Galleria>
      <!-- </div>
    </Dialog> -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import Galleria from 'primevue/galleria';
import FileUpload from 'primevue/fileupload';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const queryParams = computed(() => {
  return new URLSearchParams({
    groupId: currentBoard.value?.key || "",
  });
});

const getKeyFromString = (data: any, key: string) => {
  if (data) {
    const keyValue = JSON.parse(data);
    return keyValue?.[key] || null;
  }
  return null;
}

const selectCurrentItem = (data: any) => {
  currentItem.value = data;
  showImagesDialog.value = true;
}

const page = ref(1);
const showImagesDialog = ref(false);

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

const toggle = (event: any) => {
    menu.value.toggle(event);
};

const dt = ref();

const { result: boardsGroups } = useQuery(gql`
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
    }
  })) || [];
});

const items = computed(() => {
  return groupItems.value?.boards?.[0]?.groups?.[0]?.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    files: item.assets,
    type: item.column_values.find((col: any) => col.title === 'Type'),
    status: item.column_values.find((col: any) => col.title === 'Status'),
    csr: item.column_values.find((col: any) => col.title === 'CSR'),
    readyDate: item.column_values.find((col: any) => col.title === 'Ready Date'),
    shippingDate: item.column_values.find((col: any) => col.title === 'Shipping Date'),
  })) || [];
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


const { result: groupItems, variables: groupItemVariables, loading: itemsLoading } = useQuery(gql`
  query getGroupItems($groupId: [String], $page: Int!) {
    boards(ids: 2940773675) {
      name
      groups(ids: $groupId) {
        title
        items(limit: 25, page: $page, newest_first: true) {
          id
          name
          assets {
            url
            url_thumbnail
          }
          column_values {
            title
            additional_info
            value
          }
        }
      }
    }
  }
`, {
  groupId: [''],
  page: page.value,
});

watch(
  () => currentBoard.value,
  () => {
    if (currentBoard.value && currentBoard.value.key) {
      const id = [];
      page.value = 1;
      id.push(currentBoard.value.key || '');
      groupItemVariables.value = {
        groupId: id,
        page: page.value,
      }
    }
  }
);

watch(
  () => page.value,
  () => {
    if (page.value) {
      const id = [];
      id.push(currentBoard.value.key || '');
      groupItemVariables.value = {
        groupId: id,
        page: page.value,
      }
    }
  }
)
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