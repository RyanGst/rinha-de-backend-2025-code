#!/bin/bash
docker compose -f compose-payments.yaml up -d
docker compose -f compose.yaml up -d