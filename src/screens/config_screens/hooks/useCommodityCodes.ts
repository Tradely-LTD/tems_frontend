import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  commodityCreateSchema,
  commodityUpdateSchema,
  type CommodityCreateFormValues,
  type CommodityUpdateFormValues,
} from '../schema/commodityValidationSchema';
import {
  useGetCommoditiesQuery,
  useCreateCommodityMutation,
  useUpdateCommodityMutation,
} from '../services/commodityCodesSlice';
import type { Commodity } from '../services/types';

interface UseCommodityCodesResult {
  commodities: Commodity[];
  isEditable: boolean;
  isLoading: boolean;
  isFetching: boolean;
  fetchError: unknown;

  isAddOpen: boolean;
  openAdd: () => void;
  closeAdd: () => void;
  createForm: UseFormReturn<CommodityCreateFormValues>;
  isCreating: boolean;
  createError: unknown;
  createSuccess: boolean;
  onCreateSubmit: (e: React.FormEvent) => void;

  editingId: string | null;
  startEdit: (commodity: Commodity) => void;
  cancelEdit: () => void;
  editForm: UseFormReturn<CommodityUpdateFormValues>;
  isUpdating: boolean;
  updateError: unknown;
  updateSuccess: boolean;
  onUpdateSubmit: (e: React.FormEvent) => void;
}

const CREATE_DEFAULT_VALUES: CommodityCreateFormValues = {
  code: '',
  name: '',
  category: '',
  description: '',
};

const UPDATE_DEFAULT_VALUES: CommodityUpdateFormValues = {
  name: '',
  description: '',
  is_active: true,
};

export function useCommodityCodes(): UseCommodityCodesResult {
  const roleName = useAppSelector((s) => s.auth.user?.role_name ?? null);
  const isEditable = roleName === 'SuperAdmin' || roleName === 'JRBAccount';

  const { data, isLoading, isFetching, error: fetchError } = useGetCommoditiesQuery();
  const [createCommodity, { isLoading: isCreating }] = useCreateCommodityMutation();
  const [updateCommodity, { isLoading: isUpdating }] = useUpdateCommodityMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<unknown>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const createForm = useForm<CommodityCreateFormValues>({
    resolver: yupResolver(commodityCreateSchema),
    defaultValues: CREATE_DEFAULT_VALUES,
  });

  const editForm = useForm<CommodityUpdateFormValues>({
    resolver: yupResolver(commodityUpdateSchema),
    defaultValues: UPDATE_DEFAULT_VALUES,
  });

  const openAdd = () => {
    setCreateError(null);
    setCreateSuccess(false);
    createForm.reset(CREATE_DEFAULT_VALUES);
    setIsAddOpen(true);
  };

  const closeAdd = () => {
    setIsAddOpen(false);
    setCreateError(null);
    setCreateSuccess(false);
    createForm.reset(CREATE_DEFAULT_VALUES);
  };

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    setCreateError(null);
    setCreateSuccess(false);
    try {
      await createCommodity(values).unwrap();
      setCreateSuccess(true);
      createForm.reset(CREATE_DEFAULT_VALUES);
      setIsAddOpen(false);
    } catch (err: unknown) {
      setCreateError(err);
    }
  });

  const startEdit = (commodity: Commodity) => {
    setUpdateError(null);
    setUpdateSuccess(false);
    editForm.reset({
      name: commodity.name,
      description: commodity.description ?? '',
      is_active: commodity.is_active,
    });
    setEditingId(commodity.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUpdateError(null);
    setUpdateSuccess(false);
    editForm.reset(UPDATE_DEFAULT_VALUES);
  };

  const onUpdateSubmit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      await updateCommodity({ id: editingId, body: values }).unwrap();
      setUpdateSuccess(true);
      setEditingId(null);
    } catch (err: unknown) {
      setUpdateError(err);
    }
  });

  return {
    commodities: data?.data ?? [],
    isEditable,
    isLoading,
    isFetching,
    fetchError,

    isAddOpen,
    openAdd,
    closeAdd,
    createForm,
    isCreating,
    createError,
    createSuccess,
    onCreateSubmit,

    editingId,
    startEdit,
    cancelEdit,
    editForm,
    isUpdating,
    updateError,
    updateSuccess,
    onUpdateSubmit,
  };
}
