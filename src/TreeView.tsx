import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { SimpleTreeView } from "@mui/x-tree-view";
import { TreeItem2 } from "@mui/x-tree-view";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Input, Modal, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import { axiosInstance } from "../utils/axiosInstance";
import { fetchTreeData } from "../utils/fetchData";

export const ROOT_TREE_NAME = "%7BC9232B85-AD10-459C-A44F-70CA30C60E5F%7D"; //hardcoded value for now

interface Node {
  id: number;
  name: string;
  children: Node[];
}

const TreeView1 = () => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<null | string>(null);
  const [nodeName, setNodeName] = useState("");
  const [selectedId, setSelectedId] = useState<null | number>(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["todos"], queryFn: fetchTreeData });

  const deleteNode = async (data: any) => {
    try {
      await axiosInstance.post(
        `/api.user.tree.node.delete?treeName=${ROOT_TREE_NAME}&nodeId=${data.parentNodeId}`
      );
      setOpen(false);
    } catch (error: any) {
      setError(error.response.data.data.message);
    }
  };

  const editNode = async (data: any) => {
    try {
      await axiosInstance.post(
        `/api.user.tree.node.rename?treeName=${ROOT_TREE_NAME}&nodeId=${data.parentNodeId}&newNodeName=${data.nodeName}`
      );
      setOpen(false);
    } catch (error: any) {
      setError(error.response.data.data.message);
    }
  };

  const addNode = async (data: any) => {
    try {
      await axiosInstance.post(
        `/api.user.tree.node.create?treeName=${ROOT_TREE_NAME}&parentNodeId=${data.parentNodeId}&nodeName=${data.nodeName}`
      );
      setOpen(false);
    } catch (error: any) {
      setError(error.response.data.data.message);
    }
  };

  const handleSelect = (event: any, nodeId: number) => {
    setSelectedId(nodeId);
  };

  const addMutation = useMutation({
    mutationFn: addNode,
    onSuccess: () => {
      setNodeName("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const editMutation = useMutation({
    mutationFn: editNode,
    onSuccess: () => {
      setNodeName("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const closeModal = () => {
    setOpen(false);
    setActiveModal(null);
    setNodeName("");
  };

  const handleAdd = (id: number) => {
    setActiveModal("add");
    setOpen(true);
  };

  const handleEdit = (id: number, name: string) => {
    setActiveModal("edit");
    setOpen(true);
    setNodeName(name);
  };

  const handleDelete = (id: number) => {
    setActiveModal("delete");
    setOpen(true);
  };

  const handleSubmit = (id: number) => {
    addMutation.mutate({
      parentNodeId: id,
      nodeName: nodeName,
    });
  };

  const handleSubmitEdit = (id: number) => {
    editMutation.mutate({
      parentNodeId: id,
      nodeName: nodeName,
    });
  };

  const handleSubmitDelete = (id: number) => {
    deleteMutation.mutate({
      parentNodeId: id,
      nodeName: nodeName,
    });
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 500,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  const renderTree = (node: Node) => {
    return (
      <TreeItem2
        itemId={node.id}
        key={node.id}
        label={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "24px",
            }}
          >
            <span style={{ wordBreak: "break-all" }}>{node.name}</span>
            {selectedId === node.id && (
              <span>
                {" "}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AddIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(node.id);
                    }}
                    style={{
                      cursor: "pointer",
                      marginRight: "5px",
                      padding: "8px",
                    }}
                  />
                  <EditIcon
                    onClick={() => handleEdit(node.id, node.name)}
                    style={{
                      cursor: "pointer",
                      marginRight: "5px",
                      padding: "8px",
                    }}
                  />
                  <DeleteIcon
                    onClick={() => handleDelete(node.id)}
                    style={{ cursor: "pointer", padding: "8px" }}
                  />
                </div>
              </span>
            )}
          </div>
        }
      >
        {Array.isArray(node.children) && node.children.length > 0
          ? node.children.map((item) => renderTree(item))
          : null}
      </TreeItem2>
    );
  };

  if (query.isLoading) return <CircularProgress />;
  return (
    <SimpleTreeView onSelectedItemsChange={handleSelect}>
      <TreeItem2
        itemId={query?.data?.data.id || 1}
        key={query?.data?.data.id}
        label={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Root</span>
            {selectedId === query?.data?.data.id && (
              <span>
                {" "}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AddIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(query?.data?.data.id);
                    }}
                    style={{
                      cursor: "pointer",
                      marginRight: "5px",
                      padding: "5px",
                    }}
                  />
                </div>
              </span>
            )}
          </div>
        }
      >
        {query?.data?.data.children?.map((item: Node) => renderTree(item))}
      </TreeItem2>
      {activeModal === "add" && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {error ? (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                  color="red"
                >
                  Error
                </Typography>
                <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    closeModal();
                    setError(null);
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                >
                  Add New Item
                </Typography>
                {addMutation.isPending ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                      Write new item name
                    </Typography>
                    <Input
                      placeholder="Type in here…"
                      fullWidth
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubmit(selectedId as number)}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      )}
      {activeModal === "edit" && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {error ? (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                  color="red"
                >
                  Error
                </Typography>
                <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    closeModal();
                    setError(null);
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                >
                  Edit
                </Typography>
                {editMutation.isPending ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                      Input new name
                    </Typography>
                    <Input
                      placeholder="Type in here…"
                      fullWidth
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}

                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubmitEdit(selectedId as number)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      )}
      {activeModal === "delete" && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {error ? (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                  color="red"
                >
                  Error
                </Typography>
                <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    closeModal();
                    setError(null);
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ mb: 2 }}
                >
                  Delete
                </Typography>
                {deleteMutation.isPending ? (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography id="modal-modal-description" sx={{ mb: 2 }}>
                      Are you sure you want to delete this item?
                    </Typography>
                  </>
                )}

                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleSubmitDelete(selectedId as number)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      )}
    </SimpleTreeView>
  );
};

export default TreeView1;
