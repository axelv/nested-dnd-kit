import React, { forwardRef, Fragment, HTMLAttributes } from "react";
import classNames from "classnames";

import { Action, Handle, Remove } from "../Item";
import { Transition } from "@headlessui/react";

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  allowDrop?: boolean;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      children,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      allowDrop = true,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames("list-none box-border -mb-px", {
          "inline-block pointer-events-none p-0 pl-[10px] pt-[5px]": clone,
          "opacity-100 relative z-10 -mb-px": ghost && indicator,
          "opacity-50": ghost && !indicator,
          "pointer-events-none": disableInteraction,
        })}
        ref={wrapperRef}
        style={
          {
            paddingLeft: clone ? undefined : `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          className={classNames(
            "relative flex items-center p-2.5 bg-white border border-gray-300 text-gray-700 box-border",
            {
              "pr-6 rounded-[4px] shadow-md !py-[5px]": clone,
              "!p-0 !h-1.5":
                ghost && indicator,
              " border-blue-500 bg-blue-300": ghost && indicator && allowDrop,
              "border-red-500 bg-red-300": ghost && indicator && !allowDrop,
              "before:absolute before:-left-2 before:-top-1 before:block before:content-[''] before:w-3 before:h-3 before:bg-white before:rounded-full before:border":
                ghost && indicator,
              "before:border-blue-500": ghost && indicator && allowDrop,
              "before:border-red-500": ghost && indicator && !allowDrop,
            }
          )}
          ref={ref}
          style={style}
        >
          <Transition as={Fragment} show={!ghost || !indicator}>
            <div>
              <div className="w-full flex gap-2">
                <Handle
                  {...handleProps}
                  className={classNames({
                    "shadow-none bg-transparent": ghost,
                  })}
                />
                {onCollapse && (
                  <Action
                    onClick={onCollapse}
                    className={classNames(
                      { "shadow-none bg-transparent": ghost, }
                    )}
                  >
                    <CollapseIcon className={classNames("transition-transform duration-200", { "-rotate-90": collapsed })} />
                  </Action>
                )}
                <span
                  className={classNames(
                    "grow pl-2 whitespace-nowrap text-ellipsis overflow-hidden",
                    {
                      "shadow-none bg-transparent": ghost,
                      "select-none": clone && disableSelection,
                    }
                  )}
                >
                  {value}
                </span>
                {!clone && onRemove && (
                  <Remove
                    onClick={onRemove}
                    className={classNames({
                      "shadow-none bg-transparent": ghost,
                    })}
                  />
                )}
                {clone && childCount && childCount > 1 ? (
                  <span
                    className={classNames(
                      "absolute -top-2.5 -right-2.5 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs font-semibold text-white",
                      {
                        "shadow-none bg-transparent": ghost,
                      }
                    )}
                  >
                    {childCount}
                  </span>
                ) : null}
              </div>
              <div>
                {children}
              </div>
            </div>
          </Transition>
        </div>
      </li>
    );
  }
);

const CollapseIcon = (props: React.SVGAttributes<SVGElement>) => (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41" {...props}>
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);
