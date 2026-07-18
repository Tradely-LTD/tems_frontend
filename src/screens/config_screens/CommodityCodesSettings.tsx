import { Fragment } from 'react';
import { useCommodityCodes } from './hooks/useCommodityCodes';

export default function CommodityCodesSettings() {
  const {
    commodities,
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
  } = useCommodityCodes();

  const { register: registerCreate, formState: { errors: createErrors } } = createForm;
  const { register: registerEdit, formState: { errors: editErrors } } = editForm;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#002366]" />
        <span className="ml-3 text-[14px] text-[#444650]">Loading…</span>
      </div>
    );
  }

  // ── Fetch error state ────────────────────────────────────────────────────────
  if (fetchError != null) {
    return (
      <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.3)] rounded p-4 text-[14px] text-[#ba1a1a]">
        Failed to load commodity codes. Please refresh the page.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[24px] font-bold text-[#1a1b20] mb-1">Commodity Codes</h1>
      <p className="text-[14px] text-[#444650] mb-8">
        {isEditable
          ? 'Manage the commodity codes used across waybills and levy assessments.'
          : 'Commodity codes used across waybills and levy assessments.'}
      </p>

      {isEditable && (
        <div className="flex justify-end mb-4">
          {!isAddOpen && (
            <button
              type="button"
              onClick={openAdd}
              className="bg-[#002366] text-white text-[14px] font-semibold px-6 py-2.5 rounded hover:bg-[#003399]"
            >
              Add Commodity
            </button>
          )}
        </div>
      )}

      {isEditable && isAddOpen && (
        <div className="bg-white border border-[#c5c6d2] rounded p-6 mb-6">
          <h2 className="text-[16px] font-bold text-[#002366] uppercase tracking-wide mb-4">New Commodity</h2>

          <form onSubmit={onCreateSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="code" className="text-[13px] font-semibold text-[#444650] block mb-1">
                  Code
                </label>
                <input
                  id="code"
                  type="text"
                  {...registerCreate('code')}
                  className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
                />
                {createErrors.code && (
                  <p className="text-[12px] text-[#ba1a1a] mt-1">{createErrors.code.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="text-[13px] font-semibold text-[#444650] block mb-1">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  {...registerCreate('category')}
                  className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
                />
                {createErrors.category && (
                  <p className="text-[12px] text-[#ba1a1a] mt-1">{createErrors.category.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="text-[13px] font-semibold text-[#444650] block mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...registerCreate('name')}
                className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
              />
              {createErrors.name && (
                <p className="text-[12px] text-[#ba1a1a] mt-1">{createErrors.name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="text-[13px] font-semibold text-[#444650] block mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={2}
                {...registerCreate('description')}
                className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
              />
              {createErrors.description && (
                <p className="text-[12px] text-[#ba1a1a] mt-1">{createErrors.description.message}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-[#002366] text-white text-[14px] font-semibold px-6 py-2.5 rounded hover:bg-[#003399] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating && (
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white inline-block" />
                )}
                Create Commodity
              </button>
              <button
                type="button"
                onClick={closeAdd}
                className="text-[14px] font-semibold text-[#444650] px-4 py-2.5 rounded hover:bg-[#f3f3f5]"
              >
                Cancel
              </button>
            </div>

            {createError != null && (
              <div className="mt-4 bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.3)] rounded p-4 text-[14px] text-[#ba1a1a]">
                Failed to create commodity. Please try again.
              </div>
            )}
          </form>
        </div>
      )}

      {createSuccess && !isAddOpen && (
        <div className="mb-4 bg-[rgba(9,108,75,0.1)] border border-[#096c4b] rounded p-4 text-[14px] text-[#096c4b]">
          Commodity created successfully.
        </div>
      )}

      {updateSuccess && (
        <div className="mb-4 bg-[rgba(9,108,75,0.1)] border border-[#096c4b] rounded p-4 text-[14px] text-[#096c4b]">
          Commodity updated successfully.
        </div>
      )}

      <div className="bg-white border border-[#c5c6d2] rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#c5c6d2]">
              <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Code</th>
              <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Name</th>
              <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Category</th>
              <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Description</th>
              <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Status</th>
              {isEditable && (
                <th className="text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650] px-4 py-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {commodities.length === 0 && (
              <tr>
                <td colSpan={isEditable ? 6 : 5} className="px-4 py-6 text-center text-[14px] text-[#444650]">
                  No commodity codes found.
                </td>
              </tr>
            )}

            {commodities.map((commodity) => (
              <Fragment key={commodity.id}>
                <tr className="border-b border-[#c5c6d2] last:border-b-0">
                  <td className="px-4 py-3 text-[14px] text-[#1a1b20]">{commodity.code}</td>
                  <td className="px-4 py-3 text-[14px] text-[#1a1b20]">{commodity.name}</td>
                  <td className="px-4 py-3 text-[14px] text-[#1a1b20]">{commodity.category}</td>
                  <td className="px-4 py-3 text-[14px] text-[#1a1b20]">{commodity.description ?? '—'}</td>
                  <td className="px-4 py-3 text-[14px]">
                    {commodity.is_active ? (
                      <span className="inline-block bg-[rgba(9,108,75,0.1)] text-[#096c4b] text-[12px] font-semibold px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block bg-[rgba(186,26,26,0.08)] text-[#ba1a1a] text-[12px] font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  {isEditable && (
                    <td className="px-4 py-3 text-[14px]">
                      {editingId !== commodity.id && (
                        <button
                          type="button"
                          onClick={() => startEdit(commodity)}
                          className="text-[#002366] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>

                {isEditable && editingId === commodity.id && (
                  <tr className="border-b border-[#c5c6d2] last:border-b-0">
                    <td colSpan={6} className="px-4 py-4 bg-[#f8f8fa]">
                      <form onSubmit={onUpdateSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="edit-name" className="text-[13px] font-semibold text-[#444650] block mb-1">
                              Name
                            </label>
                            <input
                              id="edit-name"
                              type="text"
                              {...registerEdit('name')}
                              className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
                            />
                            {editErrors.name && (
                              <p className="text-[12px] text-[#ba1a1a] mt-1">{editErrors.name.message}</p>
                            )}
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#444650]">
                              <input type="checkbox" {...registerEdit('is_active')} />
                              Active
                            </label>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="edit-description" className="text-[13px] font-semibold text-[#444650] block mb-1">
                            Description
                          </label>
                          <textarea
                            id="edit-description"
                            rows={2}
                            {...registerEdit('description')}
                            className="w-full border border-[#c5c6d2] rounded px-3 py-2 text-[14px] text-[#1a1b20] bg-white focus:outline-none focus:ring-1 focus:ring-[#002366]"
                          />
                          {editErrors.description && (
                            <p className="text-[12px] text-[#ba1a1a] mt-1">{editErrors.description.message}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="bg-[#002366] text-white text-[14px] font-semibold px-6 py-2.5 rounded hover:bg-[#003399] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isUpdating && (
                              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white inline-block" />
                            )}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-[14px] font-semibold text-[#444650] px-4 py-2.5 rounded hover:bg-[#f3f3f5]"
                          >
                            Cancel
                          </button>
                        </div>

                        {updateError != null && (
                          <div className="mt-4 bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.3)] rounded p-4 text-[14px] text-[#ba1a1a]">
                            Failed to update commodity. Please try again.
                          </div>
                        )}
                      </form>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
