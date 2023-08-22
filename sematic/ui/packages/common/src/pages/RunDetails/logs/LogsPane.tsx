import styled from "@emotion/styled";
import { TextField } from "@mui/material";
import Alert from "@mui/material/Alert";
import { buttonClasses } from "@mui/material/Button";
import BidirectionalLogView, { ConciseLineTemplate } from "@sematic/common/src/pages/RunDetails/logs/BidirectionalLogView";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import useUnmount from "react-use/lib/useUnmount";
import LayoutServiceContext from "src/context/LayoutServiceContext";
import { useRunDetailsSelectionContext } from "src/context/RunDetailsSelectionContext";
import theme from "src/theme/new";

const Container = styled.div`
    max-height: 100%;
    overflow: hidden;
`;

const ScrollContainer = styled.div`
   overflow-y: auto;
   overflow-x: hidden;

   & > div:first-of-type {
        margin-bottom: ${theme.spacing(7)};
   }

   & .${buttonClasses.root} {
        color: ${theme.palette.text.primary};

        &:hover {
            color: ${theme.palette.primary.main};
        }
   }
`;

const StyledTextField = styled(TextField)`
    min-height: 50px;
    padding-left: ${theme.spacing(5)};
    border-bottom: 1px solid ${theme.palette.p3border.main};
    display: flex;
    align-items: center;
    flex-direction: row;
`;

const FloatingFooter = styled("div")`
  width: 100%;
  position: sticky;
  bottom: 0;
  height: 0;
`;

const FloatingFooterAnchor = styled("div")`
  width: 100%;
  position: absolute;
  bottom: 0;
`;

export default function LogsPane() {
    const { selectedRun } = useRunDetailsSelectionContext();
    const { id } = selectedRun! || {};
    const [filterString, setFilterString] = useState<string>("");

    const onFilterStringChange = useCallback(
        (evt: any) => {
            setFilterString(evt.target.value);
        },
        [setFilterString]
    );

    const [footerRenderProp, setFooterRenderPropState] = useState<(() => JSX.Element) | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const setFooterRenderProp = useCallback((renderProp: (() => JSX.Element) | null) => {
        setFooterRenderPropState(() => renderProp);
    }, []);

    const { setIsLoading } = useContext(LayoutServiceContext);

    useUnmount(() => {
        setIsLoading(false);
    });

    const logsSection = useMemo(() => {
        if (!selectedRun ) {
            return null;
        }
        if (selectedRun.future_state === "CREATED") {
            return <Alert severity="info" sx={{ mt: 3 }}>
                {"Run has not started. There are no logs yet."}
            </Alert>
        }
        return <>
            <StyledTextField
                variant="standard"
                fullWidth={true}
                placeholder={"Search logs..."}
                onChange={onFilterStringChange}
                style={{ flexShrink: 1 }}
            />
            <ScrollContainer ref={scrollContainerRef}>
                <BidirectionalLogView key={`${id}---${filterString}`} logSource={id}
                    filterString={filterString} scrollContainerRef={scrollContainerRef as any}
                    setFooterRenderProp={setFooterRenderProp} setIsLoading={setIsLoading}
                    LineTemplate={ConciseLineTemplate} />
                <FloatingFooter >
                    <FloatingFooterAnchor>
                        {!!footerRenderProp && footerRenderProp()}
                    </FloatingFooterAnchor>
                </FloatingFooter>
            </ScrollContainer>
        </>;
    }, [filterString, footerRenderProp, id, onFilterStringChange, selectedRun, setFooterRenderProp, setIsLoading]);

    return (
        <Container style={{ display: "flex", flexDirection: "column" }}>
            {logsSection}
        </Container>
    );
}
